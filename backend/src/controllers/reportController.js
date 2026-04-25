const reportService = require("../services/reportService");

async function createReport(req, res) {
  const report = await reportService.createReport({
    fileId: req.body.fileId,
    reason: req.body.reason,
    userId: req.user.id,
  });

  res.status(201).json({ data: report });
}

module.exports = { createReport };
