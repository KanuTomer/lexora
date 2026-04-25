const prisma = require("../prismaClient");

function create(data) {
  return prisma.auditLog.create({ data });
}

module.exports = { create };
