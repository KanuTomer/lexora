const router = require("express").Router();
const adminController = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { asyncHandler } = require("../middleware/asyncHandler");

router.use(requireAuth, requireRole("admin"));

router.get("/users", asyncHandler(adminController.listUsers));
router.post("/users", asyncHandler(adminController.createUser));
router.patch("/users/:id", asyncHandler(adminController.updateUser));
router.delete("/users/:id", asyncHandler(adminController.deleteUser));
router.patch("/users/:id/role", asyncHandler(adminController.updateUserRole));

router.get("/colleges", asyncHandler(adminController.listColleges));
router.post("/colleges", asyncHandler(adminController.createCollege));
router.patch("/colleges/:id", asyncHandler(adminController.updateCollege));
router.delete("/colleges/:id", asyncHandler(adminController.deleteCollege));

router.get("/programs", asyncHandler(adminController.listPrograms));

router.get("/courses", asyncHandler(adminController.listCourses));
router.post("/courses", asyncHandler(adminController.createCourse));

router.get("/semesters", asyncHandler(adminController.listSemesters));
router.post("/semesters", asyncHandler(adminController.createSemester));

router.get("/subjects", asyncHandler(adminController.listSubjects));
router.post("/subjects", asyncHandler(adminController.createSubject));
router.patch("/subjects/:id", asyncHandler(adminController.updateSubject));
router.delete("/subjects/:id", asyncHandler(adminController.deleteSubject));

module.exports = router;
