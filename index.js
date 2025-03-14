const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const config = require('./config');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state, printQRInTerminal: true });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', ({ connection }) => {
        if (connection === 'open') console.log(`✅ ${config.botName} connected!`);
        else if (connection === 'close') {
            console.log('❌ Connection lost. Reconnecting...');
            startBot();
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        console.log(`📩 Message from ${sender}: ${text}`);

        // Load and execute commands dynamically
        const commandFile = path.join(__dirname, 'commands', `${text.toLowerCase()}.js`);
        if (fs.existsSync(commandFile)) {
            const command = require(commandFile);
            command(sock, sender);
        }
    });
}

startBot();
