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

  if (!user.collegeId || !user.programId || !user.program) {
    throw createHttpError("Complete your college and program details before browsing academic data", 403);
  }

  if (user.program.collegeId !== user.collegeId) {
    throw createHttpError("Program-college mismatch", 403);
  }

  if (!user.program.courseId) {
    throw createHttpError("Program is not linked to a course; contact an administrator", 403);
  }

  return {
    collegeId: user.collegeId,
    id: user.program.courseId,
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

  if (subject?.course?.id !== user.program?.courseId) {
    throw createHttpError("Program-course mismatch", 403);
  }

  if (subject?.course?.collegeId !== courseScope.collegeId || subject?.course?.id !== courseScope.id) {
    throw createHttpError("Subject not found", 404);
  }
}

function assertFileInScope(file, user) {
  assertSubjectInScope(file?.subject, user);
}

module.exports = { assertFileInScope, assertSubjectInScope, getCourseScope, getSubjectScope };
