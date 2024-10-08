const express = require("express");
const path = require("path");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./db/prismaClient");
const flash = require("connect-flash");
const passport = require("passport");
require("./config/passport");
const authRouter = require("./routes/authRouter");
const { localStrategy, serialize, deserialize } = require("./config/passport");

const app = express();

app.use(express.static("public"));

app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    secret: "password",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use((req, res, next) => {
  console.log("Session:", req.session);
  console.log("User:", req.user);
  next();
});

passport.use(localStrategy);
passport.serializeUser(serialize);
passport.deserializeUser(deserialize);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
