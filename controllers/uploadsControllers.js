const multer = require("multer");
const path = require("path");
const fs = require("fs");
const prisma = require("../db/prismaClient");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("User ID: ", req.user?.id);
    console.log("Folder ID: ", req.params.folderId);

    if (!req.params.folderId) {
      return cb(new Error("Invalid path parameters"));
    }

    const folderPath = path.join(__dirname, "../uploads", req.params.folderId);

    console.log("Creating folder at: ", folderPath);
    fs.mkdirSync(folderPath, { recursive: true });

    cb(null, folderPath);
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

exports.uploadFile = upload.single("file");
