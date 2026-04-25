const subjectRepository = require("../repositories/subject.repository");
const { getSubjectScope } = require("./tenantScope");

async function listSubjects(user) {
  return subjectRepository.findMany({ where: getSubjectScope(user) });
}

async function getSubject(id, user) {
  const subject = await subjectRepository.findById(id, { where: getSubjectScope(user) });
  if (!subject) {
    const error = new Error("Subject not found");
    error.statusCode = 404;
    throw error;
  }
  return subject;
}

module.exports = { listSubjects, getSubject };
