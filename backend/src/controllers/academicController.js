const academicService = require("../services/academicService");

async function listColleges(req, res) {
  const colleges = await academicService.listColleges();
  res.json({ data: colleges });
}

async function listPrograms(req, res) {
  const programs = await academicService.listPrograms(req.query);
  res.json({ data: programs });
}

module.exports = { listColleges, listPrograms };
