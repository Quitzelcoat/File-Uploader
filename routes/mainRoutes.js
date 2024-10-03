const express = require("express");
const router = express.Router();
const mainController = requre("../controllers/mainController");

router.get("/", mainController.getHomePage);

module.exports = router;
