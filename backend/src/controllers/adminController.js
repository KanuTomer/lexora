const adminService = require("../services/adminService");

async function listUsers(req, res) {
  const users = await adminService.listUsers(req.query);
  res.json({ data: users });
}

async function updateUserRole(req, res) {
  const user = await adminService.updateUserRoleWithActor(req.user.id, req.params.id, req.body.role);
  res.json({ data: user });
}

module.exports = { listUsers, updateUserRole };
