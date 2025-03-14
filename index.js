const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const { checkForUpdates } = require('./update.js');
const { getPairingStatus } = require('./now.js');

const pairingFile = './pairing_codes.json';
const sessionFile = './sessions.json';
const logFile = './logs.txt';

let pairingCodes = fs.existsSync(pairingFile) ? JSON.parse(fs.readFileSync(pairingFile)) : {};
let sessions = fs.existsSync(sessionFile) ? JSON.parse(fs.readFileSync(sessionFile)) : {};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const sock = makeWASocket({ auth: state });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;
        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (text.startsWith('!pair')) {
            if (pairingCodes[sender]) {
                return await sock.sendMessage(sender, { text: `🔹 *Your active pairing code: ${pairingCodes[sender].code}*\n⏳ *Expires in 5 minutes!*` });
            }
            const pairNumber = generatePairingNumber(sender);
            await sock.sendMessage(sender, { text: `🔢 *Your Pairing Number:* ${pairNumber}\n⏳ *Expires in 5 minutes!*` });
        }

        if (text.startsWith('!verify ')) {
            const code = text.split(' ')[1];
            if (verifyPairingNumber(sender, code)) {
                const sessionId = generateSessionId(sender);
                await sock.sendMessage(sender, { text: `✅ *Pairing Successful!*\n🆔 *Session ID:* ${sessionId}` });
            } else {
                await sock.sendMessage(sender, { text: `❌ *Invalid or Expired Pairing Number!* Try again with *!pair*.` });
            }
        }

        if (text.startsWith('!status')) {
            const status = getPairingStatus(sender);
            let response = `📢 *Your Status:*\n\n`;

            if (status.pairing) {
                response += `🔢 *Pairing Code:* ${status.pairing}\n⏳ *Expires At:* ${status.pairingExpires}\n`;
            } else {
                response += `❌ *No active pairing code found.*\n`;
            }

            if (status.session) {
                response += `🆔 *Session ID:* ${status.session}\n📅 *Created At:* ${status.sessionCreated}\n`;
            } else {
                response += `❌ *No active session found.*\n`;
            }

            await sock.sendMessage(sender, { text: response });
        }
    });

    sock.ev.on('creds.update', saveCreds);
    console.log('✅ Bot Started!');
}

function generatePairingNumber(user) {
    const number = Math.floor(10000000 + Math.random() * 90000000).toString();
    pairingCodes[user] = { code: number, expiresAt: Date.now() + 5 * 60000 };
    fs.writeFileSync(pairingFile, JSON.stringify(pairingCodes, null, 2));
    logActivity(`✅ Generated Pairing Number for ${user}: ${number}`);
    return number;
}

function verifyPairingNumber(user, inputCode) {
    if (pairingCodes[user] && pairingCodes[user].code === inputCode && Date.now() < pairingCodes[user].expiresAt) {
        delete pairingCodes[user];
        fs.writeFileSync(pairingFile, JSON.stringify(pairingCodes, null, 2));
        logActivity(`✅ Pairing Verified for ${user}`);
        return true;
    }
    logActivity(`❌ Pairing Failed for ${user}`);
    return false;
}

function generateSessionId(user) {
    const sessionId = Math.random().toString(36).substr(2, 12).toUpperCase();
    sessions[user] = { sessionId, createdAt: Date.now() };
    fs.writeFileSync(sessionFile, JSON.stringify(sessions, null, 2));
    logActivity(`✅ Generated Session ID for ${user}: ${sessionId}`);
    return sessionId;
}

function logActivity(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
    console.log(message);
}

startBot();
setInterval(checkForUpdates, 30 * 60 * 1000);
checkForUpdates();
