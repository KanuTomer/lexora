const authService = require("../services/authService");

async function signup(req, res) {
  const session = await authService.signup(req.body);
  res.status(201).json({ data: session });
}

async function login(req, res) {
  const session = await authService.login(req.body);
  res.json({ data: session });
}

module.exports = { login, signup };
