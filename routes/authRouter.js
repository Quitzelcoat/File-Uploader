const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/signup", authController.sigUpPage);
router.get("/login", authController.logInPage);

router.get("/", authController.isAuthenticated, (req, res) => {
  res.render("main");
});

router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err); // Pass errors to the next middleware
      }
      res.redirect("/login"); // Redirect to login after logout
    });
  });
});

module.exports = router;
