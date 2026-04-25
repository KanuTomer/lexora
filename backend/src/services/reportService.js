const fileRepository = require("../repositories/fileRepository");
const reportRepository = require("../repositories/reportRepository");
const auditService = require("./auditService");

const allowedReasons = new Set(["Spam", "Wrong subject", "Duplicate", "Inappropriate"]);

function createHttpError(message, statusCode, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

async function createReport({ fileId, reason, userId }) {
  if (!fileId || !reason) {
    throw createHttpError("fileId and reason are required", 400);
  }

  if (!allowedReasons.has(reason)) {
    throw createHttpError("Invalid report reason", 400, {
      allowedReasons: Array.from(allowedReasons),
    });
  }

  const file = await fileRepository.findById(fileId);
  if (!file) {
    throw createHttpError("File not found", 404);
  }

  const existingReport = await reportRepository.findByFileAndUser(fileId, userId);
  if (existingReport) {
    throw createHttpError("You have already reported this file", 400);
  }

  try {
    const report = await reportRepository.createWithIncrement({ fileId, userId, reason });
    await auditService.logAction({
      action: "report.created",
      actorId: userId,
      targetId: fileId,
      metadata: { reason },
    });
    return report;
  } catch (error) {
    if (error.code === "P2002") {
      throw createHttpError("You have already reported this file", 400);
    }

    throw error;
  }
}

module.exports = { createReport };
