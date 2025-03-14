const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const antiLinkFile = path.join(__dirname, 'data/antilink.json');

// Load AntiLink settings
const loadAntiLink = () => {
    if (!fs.existsSync(antiLinkFile)) {
        fs.writeFileSync(antiLinkFile, JSON.stringify({}), 'utf8');
    }
    return JSON.parse(fs.readFileSync(antiLinkFile, 'utf8'));
};

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

        const isGroup = sender.endsWith("@g.us");
        let groupMetadata = null;

        if (isGroup) {
            groupMetadata = await sock.groupMetadata(sender);
        }

        // Load Anti-Link settings
        const antiLinkSettings = loadAntiLink();
        const isAntiLinkEnabled = isGroup && antiLinkSettings[groupMetadata.id];

        // Check if message contains a link
        if (isAntiLinkEnabled && text.match(/(https?:\/\/[^\s]+)/gi)) {
            await sock.sendMessage(sender, {
                text: `🚨 *Anti-Link Warning!* 🚨\nLinks are not allowed in this group!\n🚫 Message will be deleted.`,
            });

            // Delete message
            await sock.sendMessage(sender, { delete: msg.key });

            return;
        }

        // Load and execute commands dynamically
        const commandFile = path.join(__dirname, 'commands', `${text.split(' ')[0].toLowerCase()}.js`);
        if (fs.existsSync(commandFile)) {
            const command = require(commandFile);
            command(sock, sender, text, groupMetadata);
        }
    });
}

startBot();
