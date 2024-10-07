const bcrypt = require("bcryptjs");
const prisma = require("../db/prismaClient");
const passport = require("passport");

exports.signup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
      },
    });
    res.redirect("/login");
  } catch (error) {
    res.status(500).send("Error signing up");
  }
};

exports.login = passport.authenticate("local", {
  successRedirect: "/file-uploader",
  failureRedirect: "/login",
  failureFlash: true,
});

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.redirect("/");
  });
};

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
