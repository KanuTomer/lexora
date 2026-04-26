const router = require("express").Router();
const moderatorController = require("../controllers/moderatorController");
const { asyncHandler } = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, asyncHandler(moderatorController.listModerators));

module.exports = router;
