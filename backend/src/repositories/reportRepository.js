const prisma = require("../prismaClient");

function findByFileAndUser(fileId, userId) {
  return prisma.report.findUnique({
    where: { fileId_userId: { fileId, userId } },
  });
}

function createWithIncrement({ fileId, userId, reason }) {
  return prisma.$transaction(async (tx) => {
    const report = await tx.report.create({
      data: { fileId, userId, reason },
    });

    await tx.file.update({
      where: { id: fileId },
      data: { reportsCount: { increment: 1 } },
    });

    return report;
  });
}

function clearForFile(fileId) {
  return prisma.$transaction([
    prisma.report.deleteMany({ where: { fileId } }),
    prisma.file.update({
      where: { id: fileId },
      data: { reportsCount: 0 },
    }),
  ]);
}

function findRecentByFileIds(fileIds) {
  return prisma.report.findMany({
    where: { fileId: { in: fileIds } },
    orderBy: { createdAt: "desc" },
    select: { fileId: true, reason: true, createdAt: true },
  });
}

module.exports = { clearForFile, createWithIncrement, findByFileAndUser, findRecentByFileIds };
