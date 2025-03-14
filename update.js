const { exec } = require('child_process');
const fs = require('fs');

const logFile = './logs.txt';
const repoURL = 'https://github.com/KOULIKS94/Starbot-.git'; // Change this!

function logUpdate(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
    console.log(message);
}

function checkForUpdates() {
    logUpdate('🔍 Checking for updates...');
    
    exec('git pull', (error, stdout, stderr) => {
        if (error) {
            logUpdate(`❌ Update failed: ${error.message}`);
            return;
        }
        if (stdout.includes('Already up to date')) {
            logUpdate('✅ No updates found.');
        } else {
            logUpdate('🔄 Update found! Restarting bot...');
            restartBot();
        }
    });
}

function restartBot() {
    logUpdate('♻ Restarting bot...');
    exec('pm2 restart all', (error, stdout, stderr) => {
        if (error) {
            logUpdate(`❌ Restart failed: ${error.message}`);
            return;
        }
        logUpdate('✅ Bot restarted successfully!');
    });
}

module.exports = { checkForUpdates };
