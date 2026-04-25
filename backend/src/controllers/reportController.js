const reportService = require("../services/reportService");

async function createReport(req, res) {
  const report = await reportService.createReport({
    fileId: req.body.fileId,
    reason: req.body.reason,
    user: req.user,
  });

  res.status(201).json({ data: report });
}

module.exports = { createReport };
