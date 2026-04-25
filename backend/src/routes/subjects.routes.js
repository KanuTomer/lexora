const router = require("express").Router();
const subjectController = require("../controllers/subject.controller");
const { asyncHandler } = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");

router.use(requireAuth);
router.get("/", asyncHandler(subjectController.listSubjects));
router.get("/:subjectId", asyncHandler(subjectController.getSubject));

module.exports = router;
