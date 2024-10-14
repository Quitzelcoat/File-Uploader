const prisma = require("../db/prismaClient");
const path = require("path");
const fs = require("fs");

// Create Folder
exports.createFolder = async (req, res) => {
  const { name } = req.body;
  try {
    const folder = await prisma.folder.create({
      data: {
        name,
        userId: req.user.id, // Assuming req.user contains the logged-in user's info
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

// Get All Folders for a User
exports.getFolders = async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { files: true }, // Optionally include files in each folder
    });
    res.render("folders", { folders }); // Render folders page with data
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Update Folder (Rename)
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

// Delete Folder (and optionally delete its files)
exports.deleteFolder = async (req, res) => {
  const { folderId } = req.params;
  try {
    const folderPath = path.join(
      __dirname,
      "../uploads",
      req.user.id.toString(),
      folderId.toString()
    );

    // Optionally delete the files within the folder
    await prisma.file.deleteMany({ where: { folderId: parseInt(folderId) } });

    // Delete the folder itself
    await prisma.folder.delete({
      where: { id: parseInt(folderId), userId: req.user.id },
    });

    fs.rmdir(folderPath, { recursive: true }, (err) => {
      if (err) {
        console.error("Error deleting folder from filesystem:", err);
        return res.status(500).send("Failed to delete folder from filesystem.");
      }
      // Redirect to folders after successfully deleting the folder
      res.redirect("/folders");
    });

    res.redirect("/folders");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
