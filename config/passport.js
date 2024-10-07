const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const localStrategy = new LocalStrategy(async (username, password, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: username } });
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
});

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
