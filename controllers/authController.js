const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const prisma = new PrismaClient();

exports.sigUpPage = (req, res) => {
  res.render("signup");
};

exports.logInPage = (req, res) => {
  res.render("login");
};

exports.signUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.status(500).send("server Error");
  }
};

exports.logIn = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err); // Pass errors to the next middleware
    }
    if (!user) {
      return res.redirect("/login"); // Redirect back to login if authentication fails
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err); // Pass errors to the next middleware
      }
      return res.redirect("/"); // Redirect to home page on successful login
    });
  })(req, res, next);
};

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

const redirectIfAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
};
