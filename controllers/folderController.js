const prisma = require("../db/prismaClient");
const path = require("path");
const fs = require("fs");

exports.createFolder = async (req, res) => {
  const { name } = req.body;
  try {
    const folder = await prisma.folder.create({
      data: {
        name,
        userId: req.user.id,
      },
    });

    const folderPath = path.join(__dirname, "../uploads", folder.id.toString());
    fs.mkdirSync(folderPath, { recursive: true });

    res.redirect("/folders");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.getFolders = async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { files: true },
    });
    res.render("folders", { folders });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.updateFolder = async (req, res) => {
  const { folderId, newName } = req.body;
  try {
    await prisma.folder.update({
      where: { id: parseInt(folderId), userId: req.user.id },
      data: { name: newName },
    });
    res.redirect("/folders");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.deleteFolder = async (req, res) => {
  const { folderId } = req.params;
  try {
    const folderIdInt = parseInt(folderId);

    await prisma.file.deleteMany({ where: { folderId: folderIdInt } });

    const folder = await prisma.folder.delete({
      where: { id: folderIdInt, userId: req.user.id },
    });

    const folderPath = path.join(__dirname, "../uploads", `${folderIdInt}`);

    if (fs.existsSync(folderPath)) {
      fs.rm(folderPath, { recursive: true }, (err) => {
        if (err) {
          console.error("Error deleting folder from filesystem:", err);
          return res.status(500).send("Error deleting folder from filesystem");
        }
        console.log("Folder deleted from filesystem");
        res.redirect("/folders");
      });
    } else {
      console.log("Folder does not exist in filesystem");
      res.redirect("/folders");
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).send("Error deleting folder");
    }
  }
};
