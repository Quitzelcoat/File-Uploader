const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/signup", authController.sigUpPage);
router.get("/login", authController.logInPage);

module.exports = router;
