const router = require("express").Router();
const authController = require("../controllers/authController");
const { asyncHandler } = require("../middleware/asyncHandler");
const { signupAvatarUpload } = require("../middleware/uploadMiddleware");

router.post("/signup", signupAvatarUpload.single("avatar"), asyncHandler(authController.signup));
router.post("/login", asyncHandler(authController.login));

module.exports = router;
