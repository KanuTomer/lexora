const prisma = require("../prismaClient");

const publicSelect = {
  id: true,
  username: true,
  name: true,
  role: true,
  uploadPrivilege: true,
  avatarUrl: true,
  avatarPublicId: true,
  collegeId: true,
  programId: true,
  college: { select: { id: true, name: true } },
  program: { select: { id: true, name: true, collegeId: true, courseId: true } },
  createdAt: true,
};

const privateSelect = {
  ...publicSelect,
  email: true,
};

const listSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  role: true,
};

function buildUserWhere(filters = {}) {
  return {
    collegeId: filters.collegeId,
    programId: filters.programId,
    role: filters.role,
    uploadPrivilege: filters.uploadPrivilege,
  };
}

async function findMany(filters = {}) {
  return prisma.user.findMany({
    where: buildUserWhere(filters),
    orderBy: { createdAt: "desc" },
    select: listSelect,
  });
}

async function findById(id, { includeEmail = true } = {}) {
  return prisma.user.findUnique({
    where: { id },
    select: includeEmail ? privateSelect : publicSelect,
  });
}

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function create(data) {
  return prisma.user.create({
    data,
    select: privateSelect,
  });
}

async function update(id, data) {
  return prisma.user.update({
    where: { id },
    data,
    select: privateSelect,
  });
}

async function findByUsername(username) {
  return prisma.user.findUnique({ where: { username } });
}

async function findProgramById(id) {
  return prisma.program.findUnique({
    where: { id },
    select: { id: true, collegeId: true, courseId: true },
  });
}

async function adminFindMany(filters = {}) {
  return prisma.user.findMany({
    where: buildUserWhere(filters),
    orderBy: { createdAt: "desc" },
    select: privateSelect,
  });
}

async function findScopedUsers(scope) {
  return prisma.user.findMany({
    where: {
      collegeId: scope.collegeId,
      programId: scope.programId,
      role: "user",
    },
    orderBy: { username: "asc" },
    select: privateSelect,
  });
}

async function findScopedModerators(scope) {
  return prisma.user.findMany({
    where: {
      collegeId: scope.collegeId,
      programId: scope.programId,
      role: "moderator",
    },
    orderBy: [{ name: "asc" }, { username: "asc" }],
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      avatarUrl: true,
      college: { select: { id: true, name: true } },
      program: { select: { id: true, name: true } },
    },
  });
}

async function getStats(id) {
  const [uploadsCount, downloadAggregate, bookmarksCount] = await Promise.all([
    prisma.file.count({ where: { uploadedById: id } }),
    prisma.file.aggregate({
      where: { uploadedById: id },
      _sum: { downloads: true },
    }),
    prisma.bookmark.count({ where: { userId: id } }),
  ]);

  return {
    uploadsCount,
    totalDownloads: downloadAggregate._sum.downloads ?? 0,
    bookmarksCount,
  };
}

module.exports = {
  findMany,
  findById,
  findByEmail,
  findByUsername,
  findProgramById,
  create,
  update,
  getStats,
  adminFindMany,
  findScopedModerators,
  findScopedUsers,
};
