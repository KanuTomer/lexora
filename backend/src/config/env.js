const dotenv = require("dotenv");

dotenv.config();

const configuredClientOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [];

const defaultDevOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const clientOrigins = Array.from(new Set([...configuredClientOrigins, ...defaultDevOrigins]));

module.exports = {
  port: process.env.PORT || 4000,
  baseUrl: process.env.BASE_URL,
  clientOrigin: process.env.CLIENT_ORIGIN,
  clientOrigins,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
};
