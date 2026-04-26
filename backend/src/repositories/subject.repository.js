const prisma = require("../prismaClient");

async function findMany(filters = {}) {
  return prisma.subject.findMany({
    where: filters.where,
    orderBy: [{ semester: { number: "asc" } }, { subjectCode: "asc" }, { id: "asc" }],
    skip: filters.skip,
    take: filters.take,
    select: {
      id: true,
      subjectCode: true,
      subjectName: true,
      courseId: true,
      semesterId: true,
      createdAt: true,
      updatedAt: true,
      course: { select: { id: true, name: true, code: true } },
      semester: { select: { id: true, number: true } },
      _count: { select: { files: true } },
    },
  });
}

async function countMany(filters = {}) {
  return prisma.subject.count({ where: filters.where });
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

module.exports = { countMany, findMany, findById };
