const bookmarkService = require("../services/bookmark.service");

async function listBookmarks(req, res) {
  const files = await bookmarkService.listBookmarks(req.user);
  res.json({ data: files });
}

async function toggleBookmark(req, res) {
  const result = await bookmarkService.toggleBookmark(req.user, req.params.fileId);
  res.json({ data: result });
}

async function removeBookmark(req, res) {
  await bookmarkService.removeBookmark(req.params.userId, req.params.fileId);
  res.status(204).send();
}

module.exports = { listBookmarks, toggleBookmark, removeBookmark };
