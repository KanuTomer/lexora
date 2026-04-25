const prisma = require("../prismaClient");

async function findMany() {
  return prisma.subject.findMany({
    orderBy: [{ semester: { number: "asc" } }, { subjectCode: "asc" }],
    include: {
      course: { select: { id: true, name: true, code: true } },
      semester: { select: { id: true, number: true } },
      _count: { select: { files: true } },
    },
  });
}

async function findById(id) {
  return prisma.subject.findUnique({
    where: { id },
    include: {
      course: true,
      semester: true,
      files: true,
    },
  });
}

module.exports = { findMany, findById };
