const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const uploadsControllers = require("../controllers/uploadsControllers");
const prisma = require("../db/prismaClient");

router.get("/upload", authController.isAuthenticated, (req, res) => {
  res.render("fileUpload"); // Render upload form for authenticated users
});

router.get(
  "/file/:fileId",
  authController.isAuthenticated,
  uploadsControllers.viewFileDetails
);

// Route to view all files in a folder
router.get(
  "/:folderId/files",
  authController.isAuthenticated,
  uploadsControllers.viewFilesInFolder
);

router.get(
  "/files/download/:fileId",
  authController.isAuthenticated,
  uploadsControllers.downloadFile
);

router.post(
  "/upload/:folderId",
  authController.isAuthenticated,
  uploadsControllers.uploadFile,
  async (req, res) => {
    try {
      if (!req.file) {
        req.flash("error_msg", "No file uploaded");
        return res.redirect("/fileUpload");
      }

      const { originalname, path, size, mimetype } = req.file;
      const userId = req.user.id;
      const folderId = parseInt(req.params.folderId);

      await prisma.file.create({
        data: {
          originalname,
          path,
          size,
          type: mimetype,
          userId,
          folderId,
        },
      });

      req.flash("success_msg", "File uploaded successfully");
      res.redirect("/folders");
    } catch (error) {
      req.flash("error_msg", "There was an error uploading the file.");
      res.redirect("/folders");
    }
  }
);

module.exports = router;
