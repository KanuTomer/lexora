const userRepository = require("../repositories/user.repository");

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function listCourseModerators(user) {
  if (!user?.id) {
    throw createHttpError("Authentication required", 401);
  }

  if (!user.collegeId || !user.programId) {
    throw createHttpError("Complete your college and program details before viewing moderators", 403);
  }

  return userRepository.findScopedModerators({
    collegeId: user.collegeId,
    programId: user.programId,
  });
}

module.exports = { listCourseModerators };
