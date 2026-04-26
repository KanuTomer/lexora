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
  program: { select: { id: true, name: true, collegeId: true, courseId: true } },
  createdAt: true,
};

const subjectInclude = {
  course: { select: { id: true, name: true, code: true, collegeId: true } },
  semester: { select: { id: true, number: true, courseId: true } },
  catalog: { select: { id: true, collegeId: true, subjectCode: true, canonicalName: true } },
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
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: filters.skip,
    take: filters.take,
    select: userSelect,
  });
}

function countUsers(filters = {}) {
  return prisma.user.count({ where: buildUserWhere(filters) });
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

function findColleges(filters = {}) {
  return prisma.college.findMany({
    orderBy: [{ name: "asc" }, { id: "asc" }],
    skip: filters.skip,
    take: filters.take,
    include: {
      programs: { orderBy: { name: "asc" }, include: { course: { select: { id: true, name: true, code: true } } } },
      courses: { orderBy: { name: "asc" } },
      _count: { select: { users: true, programs: true, courses: true } },
    },
  });
}

function countColleges() {
  return prisma.college.count();
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
    orderBy: [{ name: "asc" }, { id: "asc" }],
    skip: filters.skip,
    take: filters.take,
    include: {
      college: { select: { id: true, name: true } },
      course: { select: { id: true, name: true, code: true, collegeId: true } },
    },
  });
}

function countPrograms(filters = {}) {
  return prisma.program.count({ where: { collegeId: filters.collegeId } });
}

function findCourses(filters = {}) {
  return prisma.course.findMany({
    where: { collegeId: filters.collegeId },
    orderBy: [{ name: "asc" }, { code: "asc" }, { id: "asc" }],
    skip: filters.skip,
    take: filters.take,
    include: {
      college: { select: { id: true, name: true } },
      semesters: { orderBy: { number: "asc" } },
    },
  });
}

function countCourses(filters = {}) {
  return prisma.course.count({ where: { collegeId: filters.collegeId } });
}

function findCourseById(id) {
  return prisma.course.findUnique({ where: { id }, include: { semesters: true } });
}

function findCourseWithCollege(id) {
  return prisma.course.findUnique({
    where: { id },
    select: { id: true, collegeId: true, name: true, code: true },
  });
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
    orderBy: [{ number: "asc" }, { id: "asc" }],
    skip: filters.skip,
    take: filters.take,
    include: { course: { select: { id: true, name: true, code: true } } },
  });
}

function countSemesters(filters = {}) {
  return prisma.semester.count({ where: { courseId: filters.courseId } });
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
    orderBy: [{ course: { name: "asc" } }, { semester: { number: "asc" } }, { subjectCode: "asc" }, { id: "asc" }],
    skip: filters.skip,
    take: filters.take,
    include: subjectInclude,
  });
}

function countSubjects(filters = {}) {
  return prisma.subject.count({
    where: {
      courseId: filters.courseId,
      semesterId: filters.semesterId,
      course: filters.collegeId ? { collegeId: filters.collegeId } : undefined,
    },
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

async function upsertProgramForCourse(course) {
  const existingByCourse = await prisma.program.findFirst({
    where: { courseId: course.id },
  });

  if (existingByCourse) {
    return prisma.program.update({
      where: { id: existingByCourse.id },
      data: {
        collegeId: course.collegeId,
        name: course.name,
      },
    });
  }

  return prisma.program.upsert({
    where: { collegeId_name: { collegeId: course.collegeId, name: course.name } },
    update: { courseId: course.id },
    create: { collegeId: course.collegeId, name: course.name, courseId: course.id },
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
  return prisma.$transaction(async (tx) => {
    const course = await tx.course.findUnique({
      where: { id: data.courseId },
      select: { collegeId: true },
    });
    if (!course) {
      throw new Error("Course not found");
    }

    const catalog = await tx.subjectCatalog.upsert({
      where: {
        collegeId_subjectCode: {
          collegeId: course.collegeId,
          subjectCode: data.subjectCode,
        },
      },
      update: { canonicalName: data.subjectName },
      create: {
        collegeId: course.collegeId,
        subjectCode: data.subjectCode,
        canonicalName: data.subjectName,
      },
    });

    return tx.subject.upsert({
      where: {
        courseId_semesterId_subjectCode: {
          courseId: data.courseId,
          semesterId: data.semesterId,
          subjectCode: data.subjectCode,
        },
      },
      update: {
        subjectName: data.subjectName,
        subjectCatalogId: catalog.id,
      },
      create: { ...data, subjectCatalogId: catalog.id },
      include: subjectInclude,
    });
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

async function resolveSubjectCatalog(tx, data) {
  const course = await tx.course.findUnique({
    where: { id: data.courseId },
    select: { collegeId: true },
  });
  if (!course) {
    throw new Error("Course not found");
  }

  return tx.subjectCatalog.upsert({
    where: {
      collegeId_subjectCode: {
        collegeId: course.collegeId,
        subjectCode: data.subjectCode,
      },
    },
    update: { canonicalName: data.subjectName },
    create: {
      collegeId: course.collegeId,
      subjectCode: data.subjectCode,
      canonicalName: data.subjectName,
    },
  });
}

function createSubject(data) {
  return prisma.$transaction(async (tx) => {
    const catalog = await resolveSubjectCatalog(tx, data);
    return tx.subject.create({
      data: { ...data, subjectCatalogId: catalog.id },
      include: subjectInclude,
    });
  });
}

function updateSubject(id, data) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.subject.findUnique({ where: { id } });
    const nextData = { ...data };

    if (data.courseId || data.subjectCode || data.subjectName) {
      const catalog = await resolveSubjectCatalog(tx, {
        courseId: data.courseId || existing.courseId,
        subjectCode: data.subjectCode || existing.subjectCode,
        subjectName: data.subjectName || existing.subjectName,
      });
      nextData.subjectCatalogId = catalog.id;
    }

    return tx.subject.update({ where: { id }, data: nextData, include: subjectInclude });
  });
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
  countColleges,
  countCourses,
  countPrograms,
  countSemesters,
  countSubjects,
  countUsers,
  deleteCollege,
  deleteSubject,
  deleteUser,
  findCollegeById,
  findCollegeByName,
  findCollegeBySlug,
  findColleges,
  findCourseByCollegeAndCode,
  findCourseById,
  findCourseWithCollege,
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
  upsertProgramForCourse,
  upsertSemester,
  upsertSubject,
};
