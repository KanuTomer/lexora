const adminService = require("../services/adminService");

async function listUsers(req, res) {
  const users = await adminService.listUsers(req.query);
  res.json({ data: users });
}

async function createUser(req, res) {
  const user = await adminService.createUser(req.user.id, req.body);
  res.status(201).json({ data: user });
}

async function updateUser(req, res) {
  const user = await adminService.updateUser(req.user.id, req.params.id, req.body);
  res.json({ data: user });
}

async function deleteUser(req, res) {
  const user = await adminService.deleteUser(req.user.id, req.params.id);
  res.json({ data: user });
}

async function updateUserRole(req, res) {
  const user = await adminService.updateUserRoleWithActor(req.user.id, req.params.id, req.body.role);
  res.json({ data: user });
}

async function listColleges(req, res) {
  const colleges = await adminService.listColleges();
  res.json({ data: colleges });
}

async function createCollege(req, res) {
  const college = await adminService.createCollege(req.user.id, req.body);
  res.status(201).json({ data: college });
}

async function updateCollege(req, res) {
  const college = await adminService.updateCollege(req.user.id, req.params.id, req.body);
  res.json({ data: college });
}

async function deleteCollege(req, res) {
  const college = await adminService.deleteCollege(req.user.id, req.params.id);
  res.json({ data: college });
}

async function listPrograms(req, res) {
  const programs = await adminService.listPrograms(req.query);
  res.json({ data: programs });
}

async function listCourses(req, res) {
  const courses = await adminService.listCourses(req.query);
  res.json({ data: courses });
}

async function createCourse(req, res) {
  const course = await adminService.createCourse(req.user.id, req.body);
  res.status(201).json({ data: course });
}

async function listSemesters(req, res) {
  const semesters = await adminService.listSemesters(req.query);
  res.json({ data: semesters });
}

async function createSemester(req, res) {
  const semester = await adminService.createSemester(req.user.id, req.body);
  res.status(201).json({ data: semester });
}

async function listSubjects(req, res) {
  const subjects = await adminService.listSubjects(req.query);
  res.json({ data: subjects });
}

async function createSubject(req, res) {
  const subject = await adminService.createSubject(req.user.id, req.body);
  res.status(201).json({ data: subject });
}

async function updateSubject(req, res) {
  const subject = await adminService.updateSubject(req.user.id, req.params.id, req.body);
  res.json({ data: subject });
}

async function deleteSubject(req, res) {
  const subject = await adminService.deleteSubject(req.user.id, req.params.id);
  res.json({ data: subject });
}

async function importAcademicData(req, res) {
  const result = await adminService.importAcademicData(req.user.id, req.body);
  res.status(201).json({ data: result });
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
  updateUserRole,
};
