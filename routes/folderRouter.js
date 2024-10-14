const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const folderController = require("../controllers/folderController");
const uploadController = require("../controllers/uploadsControllers");

// Folder Routes
router.get(
  "/folders",
  authController.isAuthenticated,
  folderController.getFolders
);
router.post(
  "/folders/create",
  authController.isAuthenticated,
  folderController.createFolder
);
router.post(
  "/folders/update",
  authController.isAuthenticated,
  folderController.updateFolder
);
router.get(
  "/folders/delete/:folderId",
  authController.isAuthenticated,
  folderController.deleteFolder
);

// Upload file to a specific folder
router.post(
  "/folders/upload",
  authController.isAuthenticated,
  uploadController.uploadFile
);

module.exports = router;
