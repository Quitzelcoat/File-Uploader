const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const uploadsControllers = require("../controllers/uploadsControllers");

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
  uploadsControllers.uploadEachFile,
  uploadsControllers.uploadFile
);

module.exports = router;
