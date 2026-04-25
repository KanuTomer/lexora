const router = require("express").Router();
const academicController = require("../controllers/academicController");
const { asyncHandler } = require("../middleware/asyncHandler");

router.get("/colleges", asyncHandler(academicController.listColleges));
router.get("/programs", asyncHandler(academicController.listPrograms));

module.exports = router;
