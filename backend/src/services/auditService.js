const auditRepository = require("../repositories/auditRepository");
const SYSTEM_ACTOR_ID = "system";

async function logAction({ action, actorId, targetId, metadata }) {
  return auditRepository.create({
    action,
    actorId: actorId || SYSTEM_ACTOR_ID,
    targetId: targetId || null,
    metadata: metadata || undefined,
  });
}

module.exports = { SYSTEM_ACTOR_ID, logAction };
