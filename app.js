const express = require("express");
const app = express();
const mainRoutes = require("./routes/mainRoutes");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", mainRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
