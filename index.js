const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const pairingFile = path.join(__dirname, 'data/pairing.json');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state, printQRInTerminal: true });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', ({ connection }) => {
        if (connection === 'open') console.log('✅ Bot is online!');
        else if (connection === 'close') {
            console.log('❌ Reconnecting...');
            startBot();
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        console.log(`📩 Message from ${sender}: ${text}`);

        // Load pairing data
        let pairingData = {};
        if (fs.existsSync(pairingFile)) {
            pairingData = JSON.parse(fs.readFileSync(pairingFile));
        }

        // If the user is not verified, allow only "pair" and "verify" commands
        if (!pairingData[sender]?.verified && text !== "pair" && !text.startsWith("verify")) {
            await sock.sendMessage(sender, { text: "🔒 You need to pair first! Send *pair* to generate a code." });
            return;
        }

        // Load and execute commands dynamically
        const commandFile = path.join(__dirname, 'commands', `${text.split(' ')[0].toLowerCase()}.js`);
        if (fs.existsSync(commandFile)) {
            const command = require(commandFile);
            command(sock, sender, text);
        }
    });
}

startBot();
