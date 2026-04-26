const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRepository = require("../repositories/authRepository");
const { jwtSecret } = require("../config/env");
const { uploadBuffer } = require("./cloudinaryService");

function debugLog(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
}

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

async function signup(payload = {}, file = null) {
  debugLog("[signup] service start", {
    hasPayload: Boolean(payload),
    payloadFields: payload ? Object.keys(payload) : [],
    hasAvatarFile: Boolean(file),
    hasAvatarBuffer: Boolean(file?.buffer),
  });

  const username = typeof payload.username === "string" ? payload.username.trim().toLowerCase() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const normalizedPayload = { username, email, password };

  debugLog("[signup] before validation", {
    hasUsername: Boolean(username),
    hasEmail: Boolean(email),
    hasPassword: Boolean(password),
  });

  const missingFields = ["username", "email", "password"].filter((field) => !normalizedPayload[field]);

  if (missingFields.length > 0) {
    throw createHttpError("Missing required signup fields", 400, { missingFields });
  }

  debugLog("[signup] validation passed");

  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    throw createHttpError("Email is already registered", 400);
  }

  debugLog("[signup] email availability check passed");

  const existingUsername = await authRepository.findByUsername(username);
  if (existingUsername) {
    throw createHttpError("Username already taken", 400);
  }

  debugLog("[signup] username availability check passed");

  const hashedPassword = await bcrypt.hash(password, 12);
  debugLog("[signup] password hashed");

  let avatarUrl = null;
  let avatarPublicId = null;

  if (file && file.buffer) {
    debugLog("[signup] before Cloudinary avatar upload", {
      mimetype: file.mimetype,
      size: file.size,
    });

    try {
      const result = await uploadBuffer(file.buffer, "lexora/avatars");
      avatarUrl = result.secure_url;
      avatarPublicId = result.public_id;
      debugLog("[signup] Cloudinary avatar upload succeeded", {
        publicId: avatarPublicId,
      });
    } catch (err) {
      console.error("[signup] Cloudinary avatar upload failed; continuing without avatar", {
        message: err.message,
        stack: err.stack,
      });
    }
  } else {
    debugLog("[signup] no avatar file supplied; skipping Cloudinary upload");
  }

  debugLog("[signup] before prisma.user.create");
  let user;
  try {
    user = await authRepository.createUser({
      username,
      email,
      password: hashedPassword,
      avatarUrl,
      avatarPublicId,
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw createHttpError("Username already exists", 400);
    }
    throw error;
  }
  debugLog("[signup] prisma.user.create succeeded", { userId: user.id });

  return {
    token: signToken(user),
    user: sanitizeUser(user),
  };
}

async function login(payload = {}) {
  const username = typeof payload.username === "string" ? payload.username.trim().toLowerCase() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const normalizedPayload = { username, password };
  const missingFields = ["username", "password"].filter((field) => !normalizedPayload[field]);

  if (missingFields.length > 0) {
    throw createHttpError("Missing required login fields", 400, { missingFields });
  }

  const user = await authRepository.findByUsername(username);
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
