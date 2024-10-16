const express = require("express");
const path = require("path");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const flash = require("connect-flash");
const passport = require("passport");

const prisma = require("./db/prismaClient");
require("./config/passport");
const authRouter = require("./routes/authRouter");
const uploadRoutes = require("./routes/uploadRoutes");
const folderRouter = require("./routes/folderRouter");
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

app.use("/uploads", express.static("uploads"));

app.use(authRouter);
app.use("/folders", uploadRoutes);
app.use(folderRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
