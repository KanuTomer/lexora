const subjectService = require("../services/subject.service");

async function listSubjects(req, res) {
  const result = await subjectService.listSubjects(req.user, req.query);
  if (result?.meta) {
    res.json(result);
    return;
  }
  res.json({ data: result });
}

async function getSubject(req, res) {
  const subject = await subjectService.getSubject(req.params.subjectId, req.user);
  res.json({ data: subject });
}

module.exports = { listSubjects, getSubject };
