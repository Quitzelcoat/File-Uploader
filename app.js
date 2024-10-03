const express = require("express");
const path = require("path");
const mainRoutes = require("./routes/mainRoutes");
const authRouter = require("./routes/authRouter");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", mainRoutes);
app.use("/", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
