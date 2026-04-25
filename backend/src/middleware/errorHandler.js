function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("Request error:", error);
    console.error("Stack:", error.stack);
  }

  const isMulterError = error.name === "MulterError";

  if (isMulterError && error.code === "LIMIT_FILE_SIZE") {
    error.statusCode = 400;
    error.message = "File too large (max 10MB)";
  }

  const statusCode = error.statusCode || (isMulterError ? 400 : 500);

  const message =
    process.env.NODE_ENV === "production"
      ? statusCode === 500
        ? "Internal server error"
        : error.message
      : error.message;

  return res.status(statusCode).json({
    message,
    details: error.details,
    stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
  });
}

module.exports = { errorHandler };
