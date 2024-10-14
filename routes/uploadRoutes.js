const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const uploadsControllers = require("../controllers/uploadsControllers");

router.get("/upload", authController.isAuthenticated, (req, res) => {
  res.render("fileUpload"); // Render upload form for authenticated users
});

router.post(
  "/upload/:folderId",
  authController.isAuthenticated,
  uploadsControllers.uploadFile,
  (req, res) => {
    if (!req.file) {
      req.flash("error_msg", "No file uploaded");
      return res.redirect("/fileUpload");
    }
    req.flash("success_msg", "File uploaded successfully");
    res.redirect("/");
  }
);

module.exports = router;
