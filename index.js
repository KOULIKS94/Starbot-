const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

const sessionFile = "./session_data.json"; 
let sessions = {}; // Stores active session IDs

// Load existing session data if available
if (fs.existsSync(sessionFile)) {
    sessions = JSON.parse(fs.readFileSync(sessionFile));
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const sender = msg.key.remoteJid;

        if (text.startsWith('!session')) {
            const sessionID = generateSessionID(sender);
            await sock.sendMessage(sender, { text: `🆔 *Your Session ID:* ${sessionID}\n\nUse this ID to track your session.` }, { quoted: msg });
        }
    });

    console.log("✅ Bot is online!");
}

function generateSessionID(user) {
    if (!sessions[user]) {
        const sessionID = `SID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        sessions[user] = { id: sessionID, createdAt: Date.now() };
        fs.writeFileSync(sessionFile, JSON.stringify(sessions, null, 2));
        console.log(`✅ New Session ID for ${user}: ${sessionID}`);
    }
    return sessions[user].id;
}

startBot();
