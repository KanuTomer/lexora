const bookmarkRepository = require("../repositories/bookmark.repository");
const fileService = require("./fileService");
const { getSubjectScope } = require("./tenantScope");

async function listBookmarks(user) {
  if (!user?.id) {
    const error = new Error("Authentication required");
    error.statusCode = 400;
    throw error;
  }

  const bookmarks = await bookmarkRepository.findByUser(user.id, { subjectWhere: getSubjectScope(user) });
  return bookmarks.map((bookmark) => bookmark.file);
}

async function toggleBookmark(user, fileId) {
  if (!user?.id || !fileId) {
    const error = new Error("userId and fileId are required");
    error.statusCode = 400;
    throw error;
  }

  await fileService.getPublicFile(fileId, user);

  const existingBookmark = await bookmarkRepository.findByUserAndFile(user.id, fileId);
  if (existingBookmark) {
    await bookmarkRepository.remove(user.id, fileId);
    return { bookmarked: false, fileId };
  }

  const bookmark = await bookmarkRepository.create(user.id, fileId);
  return { bookmarked: true, file: bookmark.file, fileId };
}

async function removeBookmark(userId, fileId) {
  return bookmarkRepository.remove(userId, fileId);
}

module.exports = { listBookmarks, toggleBookmark, removeBookmark };
