const prisma = require("../prismaClient");

function findColleges() {
  return prisma.college.findMany({
    orderBy: { name: "asc" },
    include: { programs: { orderBy: { name: "asc" } } },
  });
}

function findPrograms(filters = {}) {
  return prisma.program.findMany({
    where: { collegeId: filters.collegeId },
    orderBy: { name: "asc" },
  });
}

module.exports = { findColleges, findPrograms };
