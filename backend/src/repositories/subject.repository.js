const prisma = require("../prismaClient");

async function findMany(filters = {}) {
  return prisma.subject.findMany({
    where: filters.where,
    orderBy: [{ semester: { number: "asc" } }, { subjectCode: "asc" }],
    include: {
      course: { select: { id: true, name: true, code: true } },
      semester: { select: { id: true, number: true } },
      _count: { select: { files: true } },
    },
  });
}

async function findById(id, filters = {}) {
  return prisma.subject.findFirst({
    where: { id, ...filters.where },
    include: {
      course: true,
      semester: true,
      files: true,
    },
  });
}

module.exports = { findMany, findById };
