const usernamePattern = /^[a-z0-9._]+$/;

function normalizeUsername(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validateUsername(value) {
  const username = normalizeUsername(value);

  if (!username) {
    return { username, message: "Username is required" };
  }

  if (username.length < 3 || username.length > 30) {
    return { username, message: "Username must be 3 to 30 characters" };
  }

  if (!usernamePattern.test(username)) {
    return {
      username,
      message: "Username can only use letters, numbers, dots, and underscores",
    };
  }

  return { username, message: null };
}

module.exports = { normalizeUsername, validateUsername, usernamePattern };
