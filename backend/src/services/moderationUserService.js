const userRepository = require("../repositories/user.repository");
const auditService = require("./auditService");

const allowedPrivileges = new Set(["restricted", "trusted"]);

function canModerateTarget(actor, target) {
  if (actor.role === "admin") {
    return true;
  }

  if (target.role !== "user") {
    return false;
  }

  return Boolean(
    actor.collegeId &&
      actor.programId &&
      target.collegeId === actor.collegeId &&
      target.programId === actor.programId,
  );
}

async function listUsers(actor) {
  if (actor.role === "admin") {
    return userRepository.adminFindMany({});
  }

  if (!actor.collegeId || !actor.programId) {
    return [];
  }

  return userRepository.findScopedUsers({
    collegeId: actor.collegeId,
    programId: actor.programId,
  });
}

async function updatePrivilege(actor, targetUserId, uploadPrivilege) {
  if (!allowedPrivileges.has(uploadPrivilege)) {
    const error = new Error("Invalid upload privilege");
    error.statusCode = 400;
    throw error;
  }

  const target = await userRepository.findById(targetUserId);
  if (!target) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (target.role !== "user" && uploadPrivilege !== "trusted") {
    const error = new Error("Moderator and admin accounts must remain trusted");
    error.statusCode = 400;
    throw error;
  }

  if (!canModerateTarget(actor, target)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  const user = await userRepository.update(targetUserId, { uploadPrivilege });
  await auditService.logAction({
    action: "moderation.upload_privilege.changed",
    actorId: actor.id,
    targetId: targetUserId,
    metadata: { uploadPrivilege },
  });
  return user;
}

module.exports = { listUsers, updatePrivilege };
