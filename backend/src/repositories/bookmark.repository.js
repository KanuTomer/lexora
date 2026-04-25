const prisma = require("../prismaClient");

const fileInclude = {
  subject: {
    include: {
      semester: { select: { id: true, number: true } },
      course: { select: { id: true, name: true, code: true, collegeId: true } },
    },
  },
  uploadedBy: { select: { id: true, name: true, email: true } },
};

async function findByUser(userId, filters = {}) {
  return prisma.bookmark.findMany({
    where: {
      userId,
      file: {
        subject: filters.subjectWhere,
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
