function createHttpError(message, statusCode, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

function getCourseScope(user) {
  if (!user) {
    throw createHttpError("Authentication required", 401);
  }

  if (user.role === "admin") {
    return {};
  }

  if (!user.collegeId || !user.programId || !user.program?.name) {
    throw createHttpError("Complete your college and program details before browsing academic data", 403);
  }

  return {
    collegeId: user.collegeId,
    name: user.program.name,
  };
}

function getSubjectScope(user) {
  const courseScope = getCourseScope(user);
  return Object.keys(courseScope).length > 0 ? { course: courseScope } : {};
}

function assertSubjectInScope(subject, user) {
  const courseScope = getCourseScope(user);
  if (Object.keys(courseScope).length === 0) {
    return;
  }

  if (subject?.course?.collegeId !== courseScope.collegeId || subject?.course?.name !== courseScope.name) {
    throw createHttpError("Subject not found", 404);
  }
}

function assertFileInScope(file, user) {
  assertSubjectInScope(file?.subject, user);
}

module.exports = { assertFileInScope, assertSubjectInScope, getCourseScope, getSubjectScope };
