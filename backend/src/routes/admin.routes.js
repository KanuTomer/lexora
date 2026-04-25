const router = require("express").Router();
const adminController = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/asyncHandler");

router.use(requireAuth, requireRole("admin"));

router.get("/users", asyncHandler(adminController.listUsers));
router.patch("/users/:id/role", asyncHandler(adminController.updateUserRole));

module.exports = router;
