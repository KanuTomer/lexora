const prisma = require("../prismaClient");

const include = {
  subject: {
    include: {
      semester: { select: { id: true, number: true } },
      course: { select: { id: true, name: true, code: true, collegeId: true } },
      catalog: { select: { id: true, collegeId: true, subjectCode: true, canonicalName: true } },
    },
  },
  subjectCatalog: { select: { id: true, collegeId: true, subjectCode: true, canonicalName: true } },
  uploadedBy: { select: { id: true, username: true, name: true, avatarUrl: true } },
};

function buildWhere(filters = {}) {
  const subjectWhere = {
    ...(filters.subjectWhere ?? {}),
    ...(filters.semesterId ? { semesterId: filters.semesterId } : {}),
  };
  const subjectAccessWhere = Object.keys(subjectWhere).length > 0
    ? {
        OR: [
          { subject: subjectWhere },
          { subjectCatalog: { subjects: { some: subjectWhere } } },
        ],
      }
    : {};

  return {
    subjectId: filters.subjectId,
    subjectCatalogId: filters.subjectCatalogId,
    uploadedById: filters.uploadedById,
    fileType: filters.fileType,
    status: filters.status,
    isStale: filters.isStale,
    ...subjectAccessWhere,
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

function countByAssetId(assetId) {
  return prisma.file.count({ where: { assetId } });
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
    where: {
      ...buildWhere({ subjectWhere: filters.subjectWhere }),
      reportsCount: { gt: 0 },
    },
    orderBy: filters.orderBy ?? { reportsCount: "desc" },
    skip: filters.skip,
    take: filters.take,
    include,
  });
}

function countReported(filters = {}) {
  return prisma.file.count({
    where: {
      ...buildWhere({ subjectWhere: filters.subjectWhere }),
      reportsCount: { gt: 0 },
    },
  });
}

function findStale(filters = {}) {
  return prisma.file.findMany({
    where: buildWhere({ subjectWhere: filters.subjectWhere, isStale: true }),
    orderBy: filters.orderBy ?? { updatedAt: "asc" },
    skip: filters.skip,
    take: filters.take,
    include,
  });
}

function countStale(filters = {}) {
  return prisma.file.count({ where: buildWhere({ subjectWhere: filters.subjectWhere, isStale: true }) });
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

function findById(id, filters = {}) {
  const scopedWhere = buildWhere(filters);
  return prisma.file.findFirst({ where: { id, ...scopedWhere }, include });
}

function create(data) {
  return prisma.file.create({ data, include });
}

function findAssetByHash(contentHash) {
  return prisma.fileAsset.findUnique({ where: { contentHash } });
}

async function createAsset(data) {
  return prisma.fileAsset.create({ data });
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
  countByAssetId,
  searchMany,
  countSearch,
  findReported,
  countReported,
  findStale,
  countStale,
  markAutoApproved,
  markStale,
  findById,
  findAssetByHash,
  create,
  createAsset,
  incrementDownloads,
  updateById,
  deleteById,
};
