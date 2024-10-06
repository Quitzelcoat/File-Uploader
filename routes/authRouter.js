const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.get(
  "/login",
  authController.isNotAuthenticated,
  authController.logInPage
);
router.get(
  "/signup",
  authController.isNotAuthenticated,
  authController.sigUpPage
);

router.post(
  "/signup",
  authController.isNotAuthenticated,
  authController.signUp
);
router.post("/login", authController.isNotAuthenticated, authController.login);

router.get("/", authController.isAuthenticated, (req, res) => {
  res.render("main");
});

router.get("/logout", (req, res) => {
  req.logout(); // Passport's logout function
  req.flash("success_msg", "You are logged out");
  res.redirect("/login");
});

module.exports = router;
