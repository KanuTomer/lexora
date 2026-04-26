const router = require("express").Router();
const moderationController = require("../controllers/moderationController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/asyncHandler");

router.use(requireAuth, requireRole(["moderator", "admin"]));

router.get("/", asyncHandler(moderationController.listFiles));
router.get("/reported", asyncHandler(moderationController.listReportedFiles));
router.get("/stale", asyncHandler(moderationController.listStaleFiles));
router.get("/users", asyncHandler(moderationController.listUsers));
router.patch("/users/:id/privilege", asyncHandler(moderationController.updateUserPrivilege));
router.post("/:id/approve", asyncHandler(moderationController.approveFile));
router.post("/:id/reject", asyncHandler(moderationController.rejectFile));
router.post("/:id/delete", asyncHandler(moderationController.deleteFile));
router.post("/:id/ignore", asyncHandler(moderationController.ignoreFile));
router.post("/:id/keep", asyncHandler(moderationController.keepFile));
router.delete("/:id", asyncHandler(moderationController.deleteFile));

router.get("/files", asyncHandler(moderationController.listFiles));
router.get("/files/reported", asyncHandler(moderationController.listReportedFiles));
router.post("/files/:id/approve", asyncHandler(moderationController.approveFile));
router.post("/files/:id/reject", asyncHandler(moderationController.rejectFile));
router.post("/files/:id/delete", asyncHandler(moderationController.deleteFile));
router.post("/files/:id/ignore", asyncHandler(moderationController.ignoreFile));
router.post("/files/:id/keep", asyncHandler(moderationController.keepFile));
router.delete("/files/:id", asyncHandler(moderationController.deleteFile));

module.exports = router;
