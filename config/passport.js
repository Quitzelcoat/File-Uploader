const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const localStrategy = new LocalStrategy(async (username, password, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: username },
    });

    if (!user) {
      return done(null, false, { message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return done(null, false, { message: "Incorrect password" });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  } finally {
    await prisma.$disconnect();
  }
});

const serialize = (user, done) => {
  return done(null, user.id);
};

const deserialize = async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return done(null, user);
  } catch (err) {
    return done(err);
  } finally {
    await prisma.$disconnect;
  }
};

module.exports = {
  localStrategy,
  serialize,
  deserialize,
};
