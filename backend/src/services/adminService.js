const userRepository = require("../repositories/user.repository");
const auditService = require("./auditService");

const allowedRoles = new Set(["user", "moderator", "admin"]);

function listUsers(query = {}) {
  return userRepository.adminFindMany({
    collegeId: query.collegeId || undefined,
    programId: query.programId || undefined,
    role: query.role || undefined,
    uploadPrivilege: query.uploadPrivilege || undefined,
  });
}

async function updateUserRole(id, role) {
  if (!allowedRoles.has(role)) {
    const error = new Error("Invalid role");
    error.statusCode = 400;
    throw error;
  }

  return userRepository.update(id, { role });
}

async function updateUserRoleWithActor(actorId, id, role) {
  const user = await updateUserRole(id, role);
  await auditService.logAction({
    action: "admin.role.changed",
    actorId,
    targetId: id,
    metadata: { role },
  });
  return user;
}

module.exports = { listUsers, updateUserRole, updateUserRoleWithActor };
