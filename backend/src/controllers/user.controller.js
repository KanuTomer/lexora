const userService = require("../services/user.service");

async function listUsers(req, res) {
  const users = await userService.listUsers();
  res.json({ data: users });
}

async function getUser(req, res) {
  const user = await userService.getUser(req.params.userId);
  res.json({ data: user });
}

async function getMe(req, res) {
  const user = await userService.getCurrentUser(req.user.id);
  res.json({ data: user });
}

async function updateMe(req, res) {
  const user = await userService.updateCurrentUser(req.user.id, req.body);
  res.json({ data: user });
}

async function updateDetails(req, res) {
  const user = await userService.updateCurrentUserDetails(req.user.id, req.body);
  res.json({ data: user });
}

async function updateAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Avatar image is required" });
  }

  const user = await userService.updateAvatar(req.user.id, req.file);
  res.json({ data: user });
}

module.exports = { listUsers, getUser, getMe, updateMe, updateDetails, updateAvatar };
