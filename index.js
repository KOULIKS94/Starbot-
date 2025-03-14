const { default: makeWASocket, useMultiFileAuthState, generateRegistrationCode } = require('@whiskeysockets/baileys');
const fs = require('fs');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async ({ connection }) => {
        if (connection === 'open') {
            console.log('✅ Bot is online!');
        } else if (connection === 'close') {
            console.log('❌ Reconnecting...');
            startBot();
        }
    });

    // Generate pairing code and save it
    const pairingCode = await generateRegistrationCode(sock);
    console.log(`🔗 Pairing Code: ${pairingCode}`);
    fs.writeFileSync("./web/pairing_code.json", JSON.stringify({ code: pairingCode }));

    return pairingCode;
}

startBot();
