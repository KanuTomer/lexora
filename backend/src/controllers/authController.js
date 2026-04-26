const authService = require("../services/authService");

function debugLog(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
}

async function signup(req, res) {
  debugLog("[signup] controller received request", {
    hasBody: Boolean(req.body),
    bodyFields: req.body ? Object.keys(req.body) : [],
    hasFile: Boolean(req.file),
  });
  const session = await authService.signup(req.body, req.file);
  res.status(201).json({ data: session });
}

async function login(req, res) {
  const session = await authService.login(req.body);
  res.json({ data: session });
}

module.exports = { login, signup };
