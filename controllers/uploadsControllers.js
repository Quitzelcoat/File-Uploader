const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("User ID: ", req.user?.id);
    console.log("Folder ID: ", req.params.folderId);

    if (!req.user?.id || (!req.body?.folderId && req.body?.folderId !== "")) {
      return cb(new Error("Invalid path parameters"));
    }

    const folderPath = path.join(
      __dirname,
      "../uploads",
      `${req.user.id}`,
      req.params.folderId
    );

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

exports.uploadFile = upload.single("file");
