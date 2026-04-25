const bookmarkRepository = require("../repositories/bookmark.repository");
const fileRepository = require("../repositories/file.repository");

async function listBookmarks(userId) {
  if (!userId) {
    const error = new Error("Authentication required");
    error.statusCode = 400;
    throw error;
  }

  const bookmarks = await bookmarkRepository.findByUser(userId);
  return bookmarks.map((bookmark) => bookmark.file);
}

async function toggleBookmark(userId, fileId) {
  if (!userId || !fileId) {
    const error = new Error("userId and fileId are required");
    error.statusCode = 400;
    throw error;
  }

  const file = await fileRepository.findById(fileId);
  if (!file) {
    const error = new Error("File not found");
    error.statusCode = 404;
    throw error;
  }

  const existingBookmark = await bookmarkRepository.findByUserAndFile(userId, fileId);
  if (existingBookmark) {
    await bookmarkRepository.remove(userId, fileId);
    return { bookmarked: false, fileId };
  }

  const bookmark = await bookmarkRepository.create(userId, fileId);
  return { bookmarked: true, file: bookmark.file, fileId };
}

async function removeBookmark(userId, fileId) {
  return bookmarkRepository.remove(userId, fileId);
}

module.exports = { listBookmarks, toggleBookmark, removeBookmark };
