const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { clientOrigins } = require("./config/env");
const routes = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");
const { notFoundHandler } = require("./middleware/notFoundHandler");

const app = express();

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false, frameguard: false }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || clientOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use((req, res, next) => {
  res.removeHeader("X-Frame-Options");
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "lexora-api" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "lexora-api" });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
