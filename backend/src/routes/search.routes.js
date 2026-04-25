const router = require("express").Router();
const fileController = require("../controllers/fileController");
const { asyncHandler } = require("../middleware/asyncHandler");

router.get("/", asyncHandler(fileController.searchFiles));

module.exports = router;
