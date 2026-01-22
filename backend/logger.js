const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "activityLogs.json");

module.exports = function logActivity(entry) {
  try {
    let logs = [];

    if (fs.existsSync(logFilePath)) {
      logs = JSON.parse(fs.readFileSync(logFilePath, "utf-8") || "[]");
    }

    const logEntry = {
      time: new Date().toISOString(),
      type: entry.type || "UNKNOWN",
      empId: entry.empId || "-",
      name: entry.name || "-",
      file: entry.file || ""
    };

    // ✅ newest logs come first
    logs.unshift(logEntry);

    fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.log("❌ Logger error:", err.message);
  }
};

