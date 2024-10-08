const bcrypt = require("bcryptjs");
const prisma = require("../db/prismaClient");
const passport = require("passport");

exports.signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  console.log("Request Body:", req.body);

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).send("All fields are required");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
};

exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error_msg", info.message);
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  })(req, res, next);
};

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

exports.isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};
