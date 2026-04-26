const moderatorService = require("../services/moderatorService");

async function listModerators(req, res) {
  const moderators = await moderatorService.listCourseModerators(req.user);
  res.json({ data: moderators });
}

module.exports = { listModerators };
