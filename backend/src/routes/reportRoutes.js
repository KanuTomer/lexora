const router = require("express").Router();
const reportController = require("../controllers/reportController");
const { asyncHandler } = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");

router.post("/", requireAuth, asyncHandler(reportController.createReport));

module.exports = router;
