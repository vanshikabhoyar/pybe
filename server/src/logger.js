const fs = require('fs');
const path = require('path');

/**
 * Absolute file path where all application logs and error entries will be saved.
 */
const logFilePath = path.join(__dirname, '../app.log');

/**
 * Step 1: The Logger Function
 * 
 * Takes an error message or Exception object, formats it with the current 
 * ISO 8601 timestamp, and appends it to the app.log text file on disk.
 * 
 * @param {string|Error} message - The error message, text, or Error object to log.
 */
function log(message) {
  // Generate current timestamp (e.g. 2026-07-23T00:48:00.000Z)
  const timestamp = new Date().toISOString();
  
  // Format the log entry string with timestamp and message/stack trace
  const logEntry = `[${timestamp}] ${message && message.stack ? message.stack : message}\n`;
  
  try {
    // Append the log entry synchronously to app.log
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

module.exports = {
  log,
  logFilePath
};
