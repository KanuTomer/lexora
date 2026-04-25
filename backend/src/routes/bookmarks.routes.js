const router = require("express").Router();
const bookmarkController = require("../controllers/bookmark.controller");
const { asyncHandler } = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, asyncHandler(bookmarkController.listBookmarks));
router.post("/:fileId", requireAuth, asyncHandler(bookmarkController.toggleBookmark));

module.exports = router;
