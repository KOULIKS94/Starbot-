const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const menu = require('./commands/menu');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const sender = msg.key.remoteJid;

        if (text.startsWith('!menu')) {
            await menu(sock, msg);
        }
    });

    console.log("✅ Bot is online!");
}

startBot();
