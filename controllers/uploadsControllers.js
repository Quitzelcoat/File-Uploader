const multer = require("multer");
const path = require("path");
const fs = require("fs");
const prisma = require("../db/prismaClient");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

exports.uploadFile = async (req, res) => {
  try {
    const { folderId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      req.flash("error_msg", "No file uploaded.");
      return res.redirect(`/folders/${folderId}/files`);
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `uploads/${folderId}`, // Cloudinary folder
    });

    // Save file data to database
    await prisma.file.create({
      data: {
        originalname: req.file.originalname,
        path: result.secure_url, // Cloudinary URL
        size: BigInt(req.file.size),
        type: req.file.mimetype,
        userId: userId,
        folderId: parseInt(folderId),
      },
    });

    // Delete local file after upload to Cloudinary
    fs.unlinkSync(req.file.path);

    req.flash("success_msg", "File uploaded successfully.");
    res.redirect(`/folders/${folderId}/files`);
  } catch (error) {
    console.error("Error uploading file:", error);
    req.flash("error_msg", "Error uploading file.");
    res.redirect(`/folders/${folderId}/files`);
  }
};

// View file details
exports.viewFileDetails = async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);

    // Fetch the file details
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      req.flash("error_msg", "File not found.");
      return res.redirect("/");
    }

    // Render file details page
    res.render("fileDetails", { file });
  } catch (error) {
    console.error("Error fetching file details:", error);
    req.flash("error_msg", "There was an error fetching the file details.");
    res.redirect("/");
  }
};

// View files in folder
exports.viewFilesInFolder = async (req, res) => {
  try {
    const folderId = parseInt(req.params.folderId);

    // Fetch the folder and its associated files
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        files: true,
      },
    });

    if (!folder) {
      req.flash("error_msg", "Folder not found.");
      return res.redirect("/");
    }

    // Render folder page with list of files
    res.render("folderFiles", { folder });
  } catch (error) {
    console.error("Error fetching folder and files:", error);
    req.flash("error_msg", "There was an error fetching the folder details.");
    res.redirect("/");
  }
};

// Download file
exports.downloadFile = async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId);

    // Fetch the file details
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      req.flash("error_msg", "File not found.");
      return res.redirect("/");
    }

    // Set headers for the download
    res.download(file.path, file.originalname, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        req.flash("error_msg", "There was an error downloading the file.");
        res.redirect("/");
      }
    });
  } catch (error) {
    console.error("Error fetching file for download:", error);
    req.flash("error_msg", "There was an error fetching the file.");
    res.redirect("/");
  }
};

exports.uploadEachFile = upload.single("file");
