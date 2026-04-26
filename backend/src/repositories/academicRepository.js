const prisma = require("../prismaClient");

function findColleges() {
  return prisma.college.findMany({
    orderBy: { name: "asc" },
    include: {
      programs: {
        orderBy: { name: "asc" },
        include: { course: { select: { id: true, name: true, code: true, collegeId: true } } },
      },
    },
  });
}

function findPrograms(filters = {}) {
  return prisma.program.findMany({
    where: { collegeId: filters.collegeId },
    orderBy: { name: "asc" },
    include: { course: { select: { id: true, name: true, code: true, collegeId: true } } },
  });
}

module.exports = { findColleges, findPrograms };
