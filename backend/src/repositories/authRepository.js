const prisma = require("../prismaClient");

function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

function findByUsername(username) {
  return prisma.user.findUnique({ where: { username } });
}

function createUser(data) {
  return prisma.user.create({
    data,
    select: { id: true, username: true, name: true, email: true, role: true, uploadPrivilege: true, avatarUrl: true, createdAt: true },
  });
}

module.exports = { createUser, findByEmail, findByUsername };
