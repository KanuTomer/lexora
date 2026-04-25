require("dotenv").config();
const app = require("./app");
const { port } = require("./config/env");
require("./jobs/cron");

app.listen(port, () => {
  console.log(`Lexora API listening on port ${port}`);
});
