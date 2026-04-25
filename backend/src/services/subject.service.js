const subjectRepository = require("../repositories/subject.repository");

async function listSubjects() {
  return subjectRepository.findMany();
}

async function getSubject(id) {
  const subject = await subjectRepository.findById(id);
  if (!subject) {
    const error = new Error("Subject not found");
    error.statusCode = 404;
    throw error;
  }
  return subject;
}

module.exports = { listSubjects, getSubject };
