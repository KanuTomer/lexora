const prisma = require("../prismaClient");

const include = {
  subject: {
    include: {
      semester: { select: { id: true, number: true } },
      course: { select: { id: true, name: true, code: true } },
    },
  },
  uploadedBy: { select: { id: true, username: true, name: true, email: true, avatarUrl: true, avatarPublicId: true } },
};

function buildWhere(filters = {}) {
  return {
    subjectId: filters.subjectId,
    uploadedById: filters.uploadedById,
    fileType: filters.fileType,
    status: filters.status,
    isStale: filters.isStale,
    subject: filters.semesterId ? { semesterId: filters.semesterId } : undefined,
  };
}

function findMany(filters = {}) {
  const where = buildWhere(filters);

  return prisma.file.findMany({
    where,
    orderBy: filters.orderBy ?? { createdAt: "desc" },
    skip: filters.skip,
    take: filters.take,
    include,
  });
}

function countMany(filters = {}) {
  return prisma.file.count({ where: buildWhere(filters) });
}

function searchMany(filters = {}) {
  return prisma.file.findMany({
    where: filters.where,
    orderBy: filters.orderBy ?? { createdAt: "desc" },
    skip: filters.skip,
    take: filters.take,
    include,
  });
}

function countSearch(where) {
  return prisma.file.count({ where });
}

function findReported(filters = {}) {
  return prisma.file.findMany({
    where: { reportsCount: { gt: 0 } },
    orderBy: filters.orderBy ?? { reportsCount: "desc" },
    skip: filters.skip,
    take: filters.take,
    include,
  });
}

function countReported() {
  return prisma.file.count({ where: { reportsCount: { gt: 0 } } });
}

function findStale(filters = {}) {
  return prisma.file.findMany({
    where: { isStale: true },
    orderBy: filters.orderBy ?? { updatedAt: "asc" },
    skip: filters.skip,
    take: filters.take,
    include,
  });
}

function countStale() {
  return prisma.file.count({ where: { isStale: true } });
}

function markAutoApproved(cutoffDate) {
  return prisma.file.updateMany({
    where: {
      status: "pending",
      createdAt: { lt: cutoffDate },
      reportsCount: 0,
    },
    data: { status: "approved" },
  });
}

function markStale(cutoffDate) {
  return prisma.file.updateMany({
    where: {
      updatedAt: { lt: cutoffDate },
      isStale: false,
    },
    data: { isStale: true },
  });
}

function findById(id) {
  return prisma.file.findUnique({ where: { id }, include });
}

function create(data) {
  return prisma.file.create({ data, include });
}

function incrementDownloads(id) {
  return prisma.file.update({
    where: { id },
    data: { downloads: { increment: 1 } },
    include,
  });
}

function updateById(id, data) {
  return prisma.file.update({
    where: { id },
    data,
    include,
  });
}

function deleteById(id) {
  return prisma.file.delete({ where: { id } });
}

module.exports = {
  findMany,
  countMany,
  searchMany,
  countSearch,
  findReported,
  countReported,
  findStale,
  countStale,
  markAutoApproved,
  markStale,
  findById,
  create,
  incrementDownloads,
  updateById,
  deleteById,
};
