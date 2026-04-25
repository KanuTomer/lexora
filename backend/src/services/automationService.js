const fileRepository = require("../repositories/fileRepository");
const prisma = require("../prismaClient");
const auditService = require("./auditService");

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function promoteTrustedUsers() {
  const cutoffDate = daysAgo(30);
  const users = await prisma.user.findMany({
    where: {
      createdAt: { lt: cutoffDate },
      uploadPrivilege: "restricted",
      files: {
        none: {
          reportsCount: { gt: 0 },
        },
      },
    },
    select: { id: true },
  });

  if (users.length === 0) {
    return { count: 0 };
  }

  const result = await prisma.user.updateMany({
    where: { id: { in: users.map((user) => user.id) } },
    data: { uploadPrivilege: "trusted" },
  });
  await Promise.all(
    users.map((user) =>
      auditService.logAction({
        action: "automation.user.promoted_trusted",
        targetId: user.id,
        metadata: { uploadPrivilege: "trusted" },
      }),
    ),
  );
  return result;
}

async function autoApprovePendingFiles() {
  const cutoffDate = daysAgo(30);
  const files = await prisma.file.findMany({
    where: {
      status: "pending",
      createdAt: { lt: cutoffDate },
      reportsCount: 0,
    },
    select: { id: true },
  });
  const result = await fileRepository.markAutoApproved(cutoffDate);
  await Promise.all(
    files.map((file) =>
      auditService.logAction({
        action: "automation.file.auto_approved",
        targetId: file.id,
      }),
    ),
  );
  return result;
}

async function markStaleFiles() {
  const cutoffDate = daysAgo(365);
  const files = await prisma.file.findMany({
    where: {
      updatedAt: { lt: cutoffDate },
      isStale: false,
    },
    select: { id: true },
  });
  const result = await fileRepository.markStale(cutoffDate);
  await Promise.all(
    files.map((file) =>
      auditService.logAction({
        action: "automation.file.marked_stale",
        targetId: file.id,
      }),
    ),
  );
  return result;
}

async function runModerationMaintenance() {
  const [promotedUsers, approvedFiles, staleFiles] = await Promise.all([
    promoteTrustedUsers(),
    autoApprovePendingFiles(),
    markStaleFiles(),
  ]);

  return {
    promotedUsers: promotedUsers.count,
    approvedFiles: approvedFiles.count,
    staleFiles: staleFiles.count,
  };
}

module.exports = {
  autoApprovePendingFiles,
  markStaleFiles,
  promoteTrustedUsers,
  runModerationMaintenance,
};
