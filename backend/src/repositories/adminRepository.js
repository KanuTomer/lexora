const prisma = require("../prismaClient");

const userSelect = {
  id: true,
  username: true,
  name: true,
  email: true,
  role: true,
  uploadPrivilege: true,
  collegeId: true,
  programId: true,
  college: { select: { id: true, name: true } },
  program: { select: { id: true, name: true, collegeId: true } },
  createdAt: true,
};

const subjectInclude = {
  course: { select: { id: true, name: true, code: true, collegeId: true } },
  semester: { select: { id: true, number: true, courseId: true } },
  _count: { select: { files: true } },
};

function buildUserWhere(filters = {}) {
  return {
    collegeId: filters.collegeId,
    programId: filters.programId,
    role: filters.role,
    uploadPrivilege: filters.uploadPrivilege,
  };
}

function findUsers(filters = {}) {
  return prisma.user.findMany({
    where: buildUserWhere(filters),
    orderBy: { createdAt: "desc" },
    select: userSelect,
  });
}

function findUserById(id) {
  return prisma.user.findUnique({ where: { id }, select: userSelect });
}

function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

function findUserByUsername(username) {
  return prisma.user.findUnique({ where: { username } });
}

function createUser(data) {
  return prisma.user.create({ data, select: userSelect });
}

function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data, select: userSelect });
}

function deleteUser(id) {
  return prisma.user.delete({ where: { id }, select: userSelect });
}

function findColleges() {
  return prisma.college.findMany({
    orderBy: { name: "asc" },
    include: {
      programs: { orderBy: { name: "asc" } },
      courses: { orderBy: { name: "asc" } },
      _count: { select: { users: true, programs: true, courses: true } },
    },
  });
}

function findCollegeById(id) {
  return prisma.college.findUnique({ where: { id } });
}

function findCollegeBySlug(slug) {
  return prisma.college.findUnique({ where: { slug } });
}

function findCollegeByName(name) {
  return prisma.college.findUnique({ where: { name } });
}

function createCollege(data) {
  return prisma.college.create({ data });
}

function updateCollege(id, data) {
  return prisma.college.update({ where: { id }, data });
}

function deleteCollege(id) {
  return prisma.college.delete({ where: { id } });
}

function findPrograms(filters = {}) {
  return prisma.program.findMany({
    where: { collegeId: filters.collegeId },
    orderBy: { name: "asc" },
    include: { college: { select: { id: true, name: true } } },
  });
}

function findCourses(filters = {}) {
  return prisma.course.findMany({
    where: { collegeId: filters.collegeId },
    orderBy: [{ name: "asc" }, { code: "asc" }],
    include: {
      college: { select: { id: true, name: true } },
      semesters: { orderBy: { number: "asc" } },
    },
  });
}

function findCourseById(id) {
  return prisma.course.findUnique({ where: { id }, include: { semesters: true } });
}

function findCourseByCollegeAndCode(collegeId, code) {
  return prisma.course.findUnique({ where: { collegeId_code: { collegeId, code } } });
}

function createCourse(data) {
  return prisma.course.create({
    data,
    include: { college: { select: { id: true, name: true } }, semesters: true },
  });
}

function findSemesters(filters = {}) {
  return prisma.semester.findMany({
    where: { courseId: filters.courseId },
    orderBy: { number: "asc" },
    include: { course: { select: { id: true, name: true, code: true } } },
  });
}

function findSemesterById(id) {
  return prisma.semester.findUnique({ where: { id } });
}

function findSemesterByCourseAndNumber(courseId, number) {
  return prisma.semester.findUnique({ where: { courseId_number: { courseId, number } } });
}

function createSemester(data) {
  return prisma.semester.create({
    data,
    include: { course: { select: { id: true, name: true, code: true } } },
  });
}

function findSubjects(filters = {}) {
  return prisma.subject.findMany({
    where: {
      courseId: filters.courseId,
      semesterId: filters.semesterId,
      course: filters.collegeId ? { collegeId: filters.collegeId } : undefined,
    },
    orderBy: [{ course: { name: "asc" } }, { semester: { number: "asc" } }, { subjectCode: "asc" }],
    include: subjectInclude,
  });
}

function upsertCollege(data) {
  return prisma.college.upsert({
    where: { slug: data.slug },
    update: { name: data.name },
    create: data,
  });
}

function upsertCourse(data) {
  return prisma.course.upsert({
    where: { collegeId_code: { collegeId: data.collegeId, code: data.code } },
    update: { name: data.name },
    create: data,
    include: { college: { select: { id: true, name: true } }, semesters: true },
  });
}

function upsertSemester(data) {
  return prisma.semester.upsert({
    where: { courseId_number: { courseId: data.courseId, number: data.number } },
    update: {},
    create: data,
    include: { course: { select: { id: true, name: true, code: true } } },
  });
}

function upsertSubject(data) {
  return prisma.subject.upsert({
    where: {
      courseId_semesterId_subjectCode: {
        courseId: data.courseId,
        semesterId: data.semesterId,
        subjectCode: data.subjectCode,
      },
    },
    update: { subjectName: data.subjectName },
    create: data,
    include: subjectInclude,
  });
}

function findSubjectById(id) {
  return prisma.subject.findUnique({ where: { id }, include: subjectInclude });
}

function findSubjectByComposite(courseId, semesterId, subjectCode) {
  return prisma.subject.findUnique({
    where: { courseId_semesterId_subjectCode: { courseId, semesterId, subjectCode } },
  });
}

function createSubject(data) {
  return prisma.subject.create({ data, include: subjectInclude });
}

function updateSubject(id, data) {
  return prisma.subject.update({ where: { id }, data, include: subjectInclude });
}

function deleteSubject(id) {
  return prisma.subject.delete({ where: { id }, include: subjectInclude });
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
  findCollegeById,
  findCollegeByName,
  findCollegeBySlug,
  findColleges,
  findCourseByCollegeAndCode,
  findCourseById,
  findCourses,
  findPrograms,
  findSemesterByCourseAndNumber,
  findSemesterById,
  findSemesters,
  findSubjectByComposite,
  findSubjectById,
  findSubjects,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  findUsers,
  updateCollege,
  updateSubject,
  updateUser,
  upsertCollege,
  upsertCourse,
  upsertSemester,
  upsertSubject,
};
