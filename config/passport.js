const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const prisma = require("../db/prismaClient");

const localStrategy = new LocalStrategy(
  {
    usernameField: "email", // Specify that the username field is 'email'
    passwordField: "password",
  },
  async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email: email } });
      if (!user) {
        return done(null, false, { message: "Incorrect email." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);

const serialize = (user, done) => {
  done(null, user.id);
};

const deserialize = async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
};

module.exports = {
  localStrategy,
  serialize,
  deserialize,
};
