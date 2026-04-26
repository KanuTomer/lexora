const userRepository = require("../repositories/user.repository");
const { destroyAsset, uploadBuffer } = require("./cloudinaryService");

async function listUsers() {
  return userRepository.findMany();
}

async function getUser(id) {
  const user = await userRepository.findById(id, { includeEmail: false });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    ...user,
    stats: await userRepository.getStats(id),
  };
}

async function getCurrentUser(id) {
  const user = await userRepository.findById(id, { includeEmail: true });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    ...user,
    stats: await userRepository.getStats(id),
  };
}

async function updateCurrentUser(id, payload) {
  const data = {};

  if (Object.prototype.hasOwnProperty.call(payload, "username")) {
    const username = payload.username?.trim().toLowerCase();
    if (!username) {
      const error = new Error("Username is required");
      error.statusCode = 400;
      throw error;
    }
    const existing = await userRepository.findByUsername(username);
    if (existing && existing.id !== id) {
      const error = new Error("Username already taken");
      error.statusCode = 400;
      throw error;
    }
    data.username = username;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "email")) {
    if (!payload.email?.trim()) {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }
    const email = payload.email.trim().toLowerCase();
    const existing = await userRepository.findByEmail(email);
    if (existing && existing.id !== id) {
      const error = new Error("Email is already registered");
      error.statusCode = 400;
      throw error;
    }
    data.email = email;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "name")) {
    data.name = payload.name?.trim() || null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "collegeId")) {
    data.collegeId = payload.collegeId || null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "programId")) {
    data.programId = payload.programId || null;
  }

  if (data.programId) {
    let nextCollegeId = Object.prototype.hasOwnProperty.call(data, "collegeId") ? data.collegeId : undefined;
    if (!nextCollegeId) {
      const existingUser = await userRepository.findById(id, { includeEmail: true });
      nextCollegeId = existingUser?.collegeId;
    }
    const program = await userRepository.findProgramById(data.programId);
    if (!program) {
      const error = new Error("Program not found");
      error.statusCode = 404;
      throw error;
    }

    if (!program.courseId) {
      const error = new Error("Program is not linked to a course");
      error.statusCode = 400;
      throw error;
    }

    if (nextCollegeId && program.collegeId !== nextCollegeId) {
      const error = new Error("Program not found for selected college");
      error.statusCode = 400;
      throw error;
    }
  }

  if (Object.keys(data).length === 0) {
    const error = new Error("No profile fields provided");
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.update(id, data);
  return {
    ...user,
    stats: await userRepository.getStats(id),
  };
}

async function updateCurrentUserDetails(id, payload) {
  return updateCurrentUser(id, {
    name: payload.name,
    collegeId: payload.collegeId,
    programId: payload.programId,
  });
}

async function updateAvatar(id, file) {
  const existingUser = await userRepository.findById(id, { includeEmail: true });
  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!file || !file.buffer) {
    const error = new Error("Avatar image is required");
    error.statusCode = 400;
    throw error;
  }

  let uploadResult;
  try {
    uploadResult = await uploadBuffer(file.buffer, "lexora/avatars");
    console.log("Cloudinary avatar upload succeeded", {
      userId: id,
      publicId: uploadResult.public_id,
    });
    if (existingUser.avatarPublicId) {
      await destroyAsset(existingUser.avatarPublicId);
    }
  } catch (cloudinaryError) {
    console.error("Avatar upload failed", cloudinaryError);
    const error = new Error("Could not upload avatar");
    error.statusCode = 502;
    throw error;
  }

  const user = await userRepository.update(id, {
    avatarUrl: uploadResult.secure_url,
    avatarPublicId: uploadResult.public_id,
  });
  return {
    ...user,
    stats: await userRepository.getStats(id),
  };
}

module.exports = { listUsers, getUser, getCurrentUser, updateCurrentUser, updateCurrentUserDetails, updateAvatar };
