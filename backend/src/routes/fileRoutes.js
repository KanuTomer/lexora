const router = require("express").Router();
const fileController = require("../controllers/fileController");
const { asyncHandler } = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

router.get("/", asyncHandler(fileController.listFiles));
router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  asyncHandler(fileController.uploadFile),
);
router.get("/:id", asyncHandler(fileController.getFile));
router.patch("/:id", requireAuth, asyncHandler(fileController.updateFile));
router.delete("/:id", requireAuth, asyncHandler(fileController.deleteFile));
router.post("/:id/download", requireAuth, asyncHandler(fileController.downloadFile));

module.exports = router;
