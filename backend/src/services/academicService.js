const academicRepository = require("../repositories/academicRepository");

function listColleges() {
  return academicRepository.findColleges();
}

function listPrograms(query) {
  return academicRepository.findPrograms({ collegeId: query.collegeId });
}

module.exports = { listColleges, listPrograms };
