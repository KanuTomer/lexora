const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.resolve(__dirname, "../../../uploads");
const avatarUploadDirectory = path.resolve(uploadDirectory, "avatars");
fs.mkdirSync(uploadDirectory, { recursive: true });
fs.mkdirSync(avatarUploadDirectory, { recursive: true });
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const avatarUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error("Avatar must be an image");
      error.statusCode = 400;
      return callback(error);
    }

    return callback(null, true);
  },
});

module.exports = { upload, uploadDirectory, avatarUpload, avatarUploadDirectory };
