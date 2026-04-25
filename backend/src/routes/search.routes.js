const router = require("express").Router();
const fileController = require("../controllers/fileController");
const { asyncHandler } = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, asyncHandler(fileController.searchFiles));

module.exports = router;
