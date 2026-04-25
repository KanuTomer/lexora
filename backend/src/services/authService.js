const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/authRepository");
const { jwtSecret } = require("../config/env");

function createHttpError(message, statusCode, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    uploadPrivilege: user.uploadPrivilege,
    avatarUrl: user.avatarUrl,
  };
}

async function signup(payload) {
  const { username, email, password } = payload;
  const missingFields = ["username", "email", "password"].filter((field) => !payload[field]);

  if (missingFields.length > 0) {
    throw createHttpError("Missing required signup fields", 400, { missingFields });
  }

  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    throw createHttpError("Email is already registered", 409);
  }

  const existingUsername = await authRepository.findByUsername(username);
  if (existingUsername) {
    throw createHttpError("Username is already taken", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await authRepository.createUser({
    username: username.trim(),
    email: email.trim(),
    password: hashedPassword,
  });

  return {
    token: signToken(user),
    user: sanitizeUser(user),
  };
}

async function login(payload) {
  const { email, password } = payload;
  const missingFields = ["email", "password"].filter((field) => !payload[field]);

  if (missingFields.length > 0) {
    throw createHttpError("Missing required login fields", 400, { missingFields });
  }

  const user = await authRepository.findByEmail(email);
  if (!user || !user.password) {
    throw createHttpError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createHttpError("Invalid credentials", 401);
  }

  return {
    token: signToken(user),
    user: sanitizeUser(user),
  };
}

module.exports = { login, signup };
