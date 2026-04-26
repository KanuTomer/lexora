const router = require("express").Router();
const authController = require("../controllers/authController");
const { asyncHandler } = require("../middleware/asyncHandler");
const { authLimiter } = require("../middleware/rateLimiter");
const { signupAvatarUpload } = require("../middleware/uploadMiddleware");

router.post("/signup", authLimiter, signupAvatarUpload.single("avatar"), asyncHandler(authController.signup));
router.post("/login", authLimiter, asyncHandler(authController.login));

module.exports = router;
