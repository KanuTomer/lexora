const bcrypt = require("bcrypt");
const adminRepository = require("../repositories/adminRepository");
const auditService = require("./auditService");

const allowedRoles = new Set(["user", "moderator", "admin"]);
const allowedPrivileges = new Set(["restricted", "trusted"]);

function createHttpError(message, statusCode, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

function normalizeUsername(value) {
  return normalizeString(value).toLowerCase();
}

function normalizeSlug(value) {
  return normalizeString(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function assertUniqueUser({ id, email, username }) {
  if (email) {
    const existingEmail = await adminRepository.findUserByEmail(email);
    if (existingEmail && existingEmail.id !== id) {
      throw createHttpError("Email is already registered", 400);
    }
  }

  if (username) {
    const existingUsername = await adminRepository.findUserByUsername(username);
    if (existingUsername && existingUsername.id !== id) {
      throw createHttpError("Username already taken", 400);
    }
  }
}

async function validateUserRelations({ collegeId, programId }) {
  if (collegeId) {
    const college = await adminRepository.findCollegeById(collegeId);
    if (!college) {
      throw createHttpError("College not found", 404);
    }
  }

  if (programId) {
    const programs = await adminRepository.findPrograms({ collegeId });
    const program = programs.find((item) => item.id === programId);
    if (!program) {
      throw createHttpError("Program not found for selected college", 404);
    }
  }
}

function listUsers(query = {}) {
  if (!query.collegeId) {
    return [];
  }

  return adminRepository.findUsers({
    collegeId: query.collegeId || undefined,
    programId: query.programId || undefined,
    role: query.role || undefined,
    uploadPrivilege: query.uploadPrivilege || undefined,
  });
}

async function createUser(actorId, payload = {}) {
  const username = normalizeUsername(payload.username);
  const email = normalizeString(payload.email).toLowerCase();
  const password = typeof payload.password === "string" ? payload.password : "";
  const role = payload.role || "user";
  const uploadPrivilege = payload.uploadPrivilege || "restricted";
  const collegeId = payload.collegeId || null;
  const programId = payload.programId || null;

  const missingFields = ["username", "email", "password"].filter((field) => !{ username, email, password }[field]);
  if (missingFields.length > 0) {
    throw createHttpError("Missing required user fields", 400, { missingFields });
  }

  if (!allowedRoles.has(role)) {
    throw createHttpError("Invalid role", 400);
  }

  if (!allowedPrivileges.has(uploadPrivilege)) {
    throw createHttpError("Invalid upload privilege", 400);
  }

  await assertUniqueUser({ email, username });
  await validateUserRelations({ collegeId, programId });

  let user;
  try {
    user = await adminRepository.createUser({
      username,
      email,
      name: normalizeOptionalString(payload.name),
      password: await bcrypt.hash(password, 12),
      role,
      uploadPrivilege,
      collegeId,
      programId,
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw createHttpError("Username already exists", 400);
    }
    throw error;
  }

  await auditService.logAction({
    action: "admin.user.created",
    actorId,
    targetId: user.id,
    metadata: { role, uploadPrivilege },
  });

  return user;
}

async function updateUser(actorId, id, payload = {}) {
  const existing = await adminRepository.findUserById(id);
  if (!existing) {
    throw createHttpError("User not found", 404);
  }

  const data = {};

  if (Object.prototype.hasOwnProperty.call(payload, "username")) {
    data.username = normalizeUsername(payload.username);
    if (!data.username) {
      throw createHttpError("Username is required", 400);
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "email")) {
    data.email = normalizeString(payload.email).toLowerCase();
    if (!data.email) {
      throw createHttpError("Email is required", 400);
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "name")) {
    data.name = normalizeOptionalString(payload.name);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "role")) {
    if (!allowedRoles.has(payload.role)) {
      throw createHttpError("Invalid role", 400);
    }
    data.role = payload.role;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "uploadPrivilege")) {
    if (!allowedPrivileges.has(payload.uploadPrivilege)) {
      throw createHttpError("Invalid upload privilege", 400);
    }
    data.uploadPrivilege = payload.uploadPrivilege;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "collegeId")) {
    data.collegeId = payload.collegeId || null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "programId")) {
    data.programId = payload.programId || null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "password") && payload.password) {
    data.password = await bcrypt.hash(payload.password, 12);
  }

  if (Object.keys(data).length === 0) {
    throw createHttpError("No user fields provided", 400);
  }

  await assertUniqueUser({ id, email: data.email, username: data.username });
  await validateUserRelations({
    collegeId: Object.prototype.hasOwnProperty.call(data, "collegeId") ? data.collegeId : existing.collegeId,
    programId: Object.prototype.hasOwnProperty.call(data, "programId") ? data.programId : existing.programId,
  });

  let user;
  try {
    user = await adminRepository.updateUser(id, data);
  } catch (error) {
    if (error.code === "P2002") {
      throw createHttpError("Username already exists", 400);
    }
    throw error;
  }
  await auditService.logAction({
    action: "admin.user.updated",
    actorId,
    targetId: id,
    metadata: { fields: Object.keys(data).filter((field) => field !== "password") },
  });
  return user;
}

async function updateUserRoleWithActor(actorId, id, role) {
  return updateUser(actorId, id, { role });
}

async function deleteUser(actorId, id) {
  if (actorId === id) {
    throw createHttpError("Admins cannot delete their own account", 400);
  }

  const existing = await adminRepository.findUserById(id);
  if (!existing) {
    throw createHttpError("User not found", 404);
  }

  const user = await adminRepository.deleteUser(id);
  await auditService.logAction({ action: "admin.user.deleted", actorId, targetId: id });
  return user;
}

function listColleges() {
  return adminRepository.findColleges();
}

async function assertUniqueCollege({ id, name, slug }) {
  if (name) {
    const existingName = await adminRepository.findCollegeByName(name);
    if (existingName && existingName.id !== id) {
      throw createHttpError("College name is already used", 409);
    }
  }

  if (slug) {
    const existingSlug = await adminRepository.findCollegeBySlug(slug);
    if (existingSlug && existingSlug.id !== id) {
      throw createHttpError("College slug is already used", 409);
    }
  }
}

async function createCollege(actorId, payload = {}) {
  const name = normalizeString(payload.name);
  const slug = normalizeSlug(payload.slug || name);

  if (!name || !slug) {
    throw createHttpError("College name and slug are required", 400);
  }

  await assertUniqueCollege({ name, slug });
  const college = await adminRepository.createCollege({ name, slug });
  await auditService.logAction({ action: "admin.college.created", actorId, targetId: college.id });
  return college;
}

async function updateCollege(actorId, id, payload = {}) {
  const existing = await adminRepository.findCollegeById(id);
  if (!existing) {
    throw createHttpError("College not found", 404);
  }

  const data = {};
  if (Object.prototype.hasOwnProperty.call(payload, "name")) {
    data.name = normalizeString(payload.name);
    if (!data.name) throw createHttpError("College name is required", 400);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "slug")) {
    data.slug = normalizeSlug(payload.slug);
    if (!data.slug) throw createHttpError("College slug is required", 400);
  }

  if (Object.keys(data).length === 0) {
    throw createHttpError("No college fields provided", 400);
  }

  await assertUniqueCollege({ id, name: data.name, slug: data.slug });
  const college = await adminRepository.updateCollege(id, data);
  await auditService.logAction({ action: "admin.college.updated", actorId, targetId: id });
  return college;
}

async function deleteCollege(actorId, id) {
  const existing = await adminRepository.findCollegeById(id);
  if (!existing) {
    throw createHttpError("College not found", 404);
  }

  const college = await adminRepository.deleteCollege(id);
  await auditService.logAction({ action: "admin.college.deleted", actorId, targetId: id });
  return college;
}

function listPrograms(query = {}) {
  if (!query.collegeId) {
    return [];
  }
  return adminRepository.findPrograms({ collegeId: query.collegeId || undefined });
}

function listCourses(query = {}) {
  if (!query.collegeId) {
    return [];
  }
  return adminRepository.findCourses({ collegeId: query.collegeId || undefined });
}

async function createCourse(actorId, payload = {}) {
  const name = normalizeString(payload.name);
  const code = normalizeString(payload.code).toUpperCase();
  const collegeId = payload.collegeId;

  if (!name || !code || !collegeId) {
    throw createHttpError("Course name, code, and college are required", 400);
  }

  const college = await adminRepository.findCollegeById(collegeId);
  if (!college) {
    throw createHttpError("College not found", 404);
  }

  const existing = await adminRepository.findCourseByCollegeAndCode(collegeId, code);
  if (existing) {
    throw createHttpError("Course code already exists for this college", 409);
  }

  const course = await adminRepository.createCourse({ name, code, collegeId });
  await auditService.logAction({ action: "admin.course.created", actorId, targetId: course.id });
  return course;
}

function listSemesters(query = {}) {
  if (!query.courseId) {
    return [];
  }
  return adminRepository.findSemesters({ courseId: query.courseId || undefined });
}

async function createSemester(actorId, payload = {}) {
  const courseId = payload.courseId;
  const number = Number(payload.number);

  if (!courseId || !Number.isInteger(number) || number < 1) {
    throw createHttpError("Course and valid semester number are required", 400);
  }

  const course = await adminRepository.findCourseById(courseId);
  if (!course) {
    throw createHttpError("Course not found", 404);
  }

  const existing = await adminRepository.findSemesterByCourseAndNumber(courseId, number);
  if (existing) {
    throw createHttpError("Semester already exists for this course", 409);
  }

  const semester = await adminRepository.createSemester({ courseId, number });
  await auditService.logAction({ action: "admin.semester.created", actorId, targetId: semester.id });
  return semester;
}

function listSubjects(query = {}) {
  if (!query.collegeId && !query.courseId) {
    return [];
  }

  return adminRepository.findSubjects({
    collegeId: query.collegeId || undefined,
    courseId: query.courseId || undefined,
    semesterId: query.semesterId || undefined,
  });
}

function validateImportPayload(payload = {}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createHttpError("Invalid import payload", 400);
  }

  const collegeName = normalizeString(payload.college?.name);
  const collegeSlug = normalizeSlug(payload.college?.slug || collegeName);
  if (!collegeName || !collegeSlug) {
    throw createHttpError("Import requires college name and slug", 400);
  }

  if (!Array.isArray(payload.courses) || payload.courses.length === 0) {
    throw createHttpError("Import requires at least one course", 400);
  }

  const subjectKeys = new Set();
  const courses = payload.courses.map((course, courseIndex) => {
    const code = normalizeString(course.code).toUpperCase();
    const name = normalizeString(course.name);
    if (!code || !name) {
      throw createHttpError(`Course at index ${courseIndex} requires code and name`, 400);
    }

    if (!Array.isArray(course.semesters)) {
      throw createHttpError(`Course ${code} requires a semesters array`, 400);
    }

    const semesters = course.semesters.map((semester, semesterIndex) => {
      const number = Number(semester.number);
      if (!Number.isInteger(number) || number < 1) {
        throw createHttpError(`Invalid semester number at course ${code}, index ${semesterIndex}`, 400);
      }

      if (!Array.isArray(semester.subjects)) {
        throw createHttpError(`Semester ${number} in ${code} requires a subjects array`, 400);
      }

      const subjects = semester.subjects.map((subject, subjectIndex) => {
        const subjectCode = normalizeString(subject.code || subject.subjectCode).toUpperCase();
        const subjectName = normalizeString(subject.name || subject.subjectName);
        if (!subjectCode || !subjectName) {
          throw createHttpError(`Invalid subject at ${code} semester ${number}, index ${subjectIndex}`, 400);
        }

        const key = `${code}:${number}:${subjectCode}`;
        if (subjectKeys.has(key)) {
          throw createHttpError(`Duplicate subject combination in import: ${code} semester ${number} ${subjectCode}`, 400);
        }
        subjectKeys.add(key);

        return { subjectCode, subjectName };
      });

      return { number, subjects };
    });

    return { code, name, semesters };
  });

  return { college: { name: collegeName, slug: collegeSlug }, courses };
}

async function importAcademicData(actorId, payload = {}) {
  const data = validateImportPayload(payload);
  const summary = { colleges: 0, courses: 0, semesters: 0, subjects: 0 };

  const college = await adminRepository.upsertCollege(data.college);
  summary.colleges += 1;

  for (const courseInput of data.courses) {
    const course = await adminRepository.upsertCourse({
      collegeId: college.id,
      code: courseInput.code,
      name: courseInput.name,
    });
    summary.courses += 1;

    for (const semesterInput of courseInput.semesters) {
      const semester = await adminRepository.upsertSemester({
        courseId: course.id,
        number: semesterInput.number,
      });
      summary.semesters += 1;

      for (const subjectInput of semesterInput.subjects) {
        await adminRepository.upsertSubject({
          courseId: course.id,
          semesterId: semester.id,
          subjectCode: subjectInput.subjectCode,
          subjectName: subjectInput.subjectName,
        });
        summary.subjects += 1;
      }
    }
  }

  await auditService.logAction({
    action: "admin.academic.imported",
    actorId,
    targetId: college.id,
    metadata: summary,
  });

  return { college, summary };
}

async function validateSubjectRelations(courseId, semesterId) {
  const [course, semester] = await Promise.all([
    adminRepository.findCourseById(courseId),
    adminRepository.findSemesterById(semesterId),
  ]);

  if (!course) {
    throw createHttpError("Course not found", 404);
  }

  if (!semester || semester.courseId !== courseId) {
    throw createHttpError("Semester not found for selected course", 404);
  }
}

async function assertUniqueSubject({ id, courseId, semesterId, subjectCode }) {
  const existing = await adminRepository.findSubjectByComposite(courseId, semesterId, subjectCode);
  if (existing && existing.id !== id) {
    throw createHttpError("Subject code already exists for this course and semester", 409);
  }
}

async function createSubject(actorId, payload = {}) {
  const subjectCode = normalizeString(payload.subjectCode).toUpperCase();
  const subjectName = normalizeString(payload.subjectName);
  const courseId = payload.courseId;
  const semesterId = payload.semesterId;

  const missingFields = ["subjectCode", "subjectName", "courseId", "semesterId"].filter(
    (field) => !{ subjectCode, subjectName, courseId, semesterId }[field],
  );
  if (missingFields.length > 0) {
    throw createHttpError("Missing required subject fields", 400, { missingFields });
  }

  await validateSubjectRelations(courseId, semesterId);
  await assertUniqueSubject({ courseId, semesterId, subjectCode });

  const subject = await adminRepository.createSubject({ subjectCode, subjectName, courseId, semesterId });
  await auditService.logAction({ action: "admin.subject.created", actorId, targetId: subject.id });
  return subject;
}

async function updateSubject(actorId, id, payload = {}) {
  const existing = await adminRepository.findSubjectById(id);
  if (!existing) {
    throw createHttpError("Subject not found", 404);
  }

  const data = {};
  if (Object.prototype.hasOwnProperty.call(payload, "subjectCode")) {
    data.subjectCode = normalizeString(payload.subjectCode).toUpperCase();
    if (!data.subjectCode) throw createHttpError("Subject code is required", 400);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "subjectName")) {
    data.subjectName = normalizeString(payload.subjectName);
    if (!data.subjectName) throw createHttpError("Subject name is required", 400);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "courseId")) {
    data.courseId = payload.courseId;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "semesterId")) {
    data.semesterId = payload.semesterId;
  }

  if (Object.keys(data).length === 0) {
    throw createHttpError("No subject fields provided", 400);
  }

  const nextCourseId = data.courseId || existing.courseId;
  const nextSemesterId = data.semesterId || existing.semesterId;
  const nextSubjectCode = data.subjectCode || existing.subjectCode;

  await validateSubjectRelations(nextCourseId, nextSemesterId);
  await assertUniqueSubject({ id, courseId: nextCourseId, semesterId: nextSemesterId, subjectCode: nextSubjectCode });

  const subject = await adminRepository.updateSubject(id, data);
  await auditService.logAction({ action: "admin.subject.updated", actorId, targetId: id });
  return subject;
}

async function deleteSubject(actorId, id) {
  const existing = await adminRepository.findSubjectById(id);
  if (!existing) {
    throw createHttpError("Subject not found", 404);
  }

  const subject = await adminRepository.deleteSubject(id);
  await auditService.logAction({ action: "admin.subject.deleted", actorId, targetId: id });
  return subject;
}

module.exports = {
  createCollege,
  createCourse,
  createSemester,
  createSubject,
  createUser,
  deleteCollege,
  deleteSubject,
  deleteUser,
  importAcademicData,
  listColleges,
  listCourses,
  listPrograms,
  listSemesters,
  listSubjects,
  listUsers,
  updateCollege,
  updateSubject,
  updateUser,
  updateUserRoleWithActor,
};
