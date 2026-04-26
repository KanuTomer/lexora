const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.resolve(__dirname, "../../../uploads");
const avatarUploadDirectory = path.resolve(uploadDirectory, "avatars");
fs.mkdirSync(uploadDirectory, { recursive: true });
fs.mkdirSync(avatarUploadDirectory, { recursive: true });
const storage = multer.memoryStorage();
const allowedUploadMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg"]);
const allowedUploadExtensions = new Set([".pdf", ".png", ".jpg", ".jpeg"]);

function validateUploadFile(req, file, callback) {
  const extension = path.extname(file.originalname || "").toLowerCase();

  if (!allowedUploadMimeTypes.has(file.mimetype) || !allowedUploadExtensions.has(extension)) {
    const error = new Error("Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed.");
    error.statusCode = 400;
    return callback(error);
  }

  return callback(null, true);
}

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: validateUploadFile,
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

const signupAvatarUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith("image/")) {
      console.warn("[signup] Ignoring non-image avatar upload", {
        mimetype: file.mimetype,
        originalname: file.originalname,
      });
      return callback(null, false);
    }

    return callback(null, true);
  },
});

module.exports = { upload, uploadDirectory, avatarUpload, signupAvatarUpload, avatarUploadDirectory };
