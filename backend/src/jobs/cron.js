const cron = require("node-cron");
const { runModerationMaintenance } = require("../services/automationService");

console.log("Moderation maintenance cron scheduled for 3:00 AM daily");

cron.schedule("0 3 * * *", async () => {
  try {
    console.log("Running moderation maintenance...");
    await runModerationMaintenance();
  } catch (err) {
    console.error("Cron job failed:", err);
  }
});
