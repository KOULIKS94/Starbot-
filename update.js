const { checkForUpdates } = require('./update.js');

// Check for updates every 30 minutes
setInterval(checkForUpdates, 30 * 60 * 1000);

// Run update check on bot startup
checkForUpdates();
