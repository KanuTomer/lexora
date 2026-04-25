const router = require("express").Router();
const userController = require("../controllers/user.controller");
const { asyncHandler } = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");
const { avatarUpload } = require("../middleware/uploadMiddleware");

router.get("/", asyncHandler(userController.listUsers));
router.get("/me", requireAuth, asyncHandler(userController.getMe));
router.patch("/me", requireAuth, asyncHandler(userController.updateMe));
router.patch("/me/details", requireAuth, asyncHandler(userController.updateDetails));
router.patch(
  "/me/avatar",
  requireAuth,
  avatarUpload.single("avatar"),
  asyncHandler(userController.updateAvatar),
);
router.get("/:userId", asyncHandler(userController.getUser));

module.exports = router;
