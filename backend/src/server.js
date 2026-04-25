require("dotenv").config();
const app = require("./app");
require("./jobs/cron");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Lexora API listening on port ${PORT}`);
});