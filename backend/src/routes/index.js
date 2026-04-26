const router = require("express").Router();
const authRoutes = require("./authRoutes");
const academicRoutes = require("./academic.routes");
const adminRoutes = require("./admin.routes");
const bookmarkRoutes = require("./bookmarks.routes");
const fileRoutes = require("./files.routes");
const moderatorRoutes = require("./moderators.routes");
const moderationRoutes = require("./moderation.routes");
const reportRoutes = require("./reportRoutes");
const searchRoutes = require("./search.routes");
const subjectRoutes = require("./subjects.routes");
const userRoutes = require("./users.routes");

router.use("/auth", authRoutes);
router.use("/", academicRoutes);
router.use("/admin", adminRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/files", fileRoutes);
router.use("/moderators", moderatorRoutes);
router.use("/moderation", moderationRoutes);
router.use("/reports", reportRoutes);
router.use("/search", searchRoutes);
router.use("/subjects", subjectRoutes);
router.use("/users", userRoutes);

module.exports = router;
