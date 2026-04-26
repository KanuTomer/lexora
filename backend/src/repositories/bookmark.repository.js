const prisma = require("../prismaClient");

const fileInclude = {
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

async function findByUser(userId, filters = {}) {
  const scopedFileWhere = filters.subjectWhere
    ? {
        OR: [
          { subject: filters.subjectWhere },
          { subjectCatalog: { subjects: { some: filters.subjectWhere } } },
        ],
      }
    : {};

  return prisma.bookmark.findMany({
    where: {
      userId,
      file: {
        ...scopedFileWhere,
        status: "approved",
      },
    },
    orderBy: { createdAt: "desc" },
    include: { file: { include: fileInclude } },
  });
}

async function findByUserAndFile(userId, fileId) {
  return prisma.bookmark.findUnique({
    where: { userId_fileId: { userId, fileId } },
    include: { file: { include: fileInclude } },
  });
}

async function create(userId, fileId) {
  return prisma.bookmark.create({
    data: { userId, fileId },
    include: { file: { include: fileInclude } },
  });
}

async function remove(userId, fileId) {
  return prisma.bookmark.delete({
    where: { userId_fileId: { userId, fileId } },
  });
}

module.exports = { findByUser, findByUserAndFile, create, remove };
