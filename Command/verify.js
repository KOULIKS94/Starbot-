const fs = require('fs');
const path = require('path');
const pairingFile = path.join(__dirname, '../data/pairing.json');

module.exports = async (sock, sender, text) => {
    let pairingData = {};

    // Load pairing data
    if (fs.existsSync(pairingFile)) {
        pairingData = JSON.parse(fs.readFileSync(pairingFile));
    }

    const userCode = text.split(' ')[1]; // Extract the code from the message

    if (!userCode || !pairingData[sender]) {
        await sock.sendMessage(sender, { text: "⚠️ Please provide a valid pairing code!" });
        return;
    }

    // Check if code is correct
    if (pairingData[sender].code === userCode) {
        pairingData[sender].verified = true;
        fs.writeFileSync(pairingFile, JSON.stringify(pairingData, null, 2));
        await sock.sendMessage(sender, { text: "✅ Pairing successful! You can now use all commands." });
    } else {
        await sock.sendMessage(sender, { text: "❌ Incorrect code! Try again." });
    }
};
