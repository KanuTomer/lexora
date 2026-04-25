const subjectService = require("../services/subject.service");

async function listSubjects(req, res) {
  const subjects = await subjectService.listSubjects();
  res.json({ data: subjects });
}

async function getSubject(req, res) {
  const subject = await subjectService.getSubject(req.params.subjectId);
  res.json({ data: subject });
}

module.exports = { listSubjects, getSubject };
