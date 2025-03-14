const fs = require('fs');
const path = require('path');

const antiLinkFile = path.join(__dirname, '../data/antilink.json');

// Load AntiLink settings
const loadAntiLink = () => {
    if (!fs.existsSync(antiLinkFile)) {
        fs.writeFileSync(antiLinkFile, JSON.stringify({}), 'utf8');
    }
    return JSON.parse(fs.readFileSync(antiLinkFile, 'utf8'));
};

// Save AntiLink settings
const saveAntiLink = (settings) => {
    fs.writeFileSync(antiLinkFile, JSON.stringify(settings, null, 2), 'utf8');
};

module.exports = async (sock, sender, text, groupMetadata) => {
    if (!groupMetadata) {
        await sock.sendMessage(sender, { text: "❌ This command works only in groups!" });
        return;
    }

    const groupId = groupMetadata.id;
    const command = text.split(' ')[1];
    let antiLinkSettings = loadAntiLink();

    if (command === "on") {
        antiLinkSettings[groupId] = true;
        saveAntiLink(antiLinkSettings);
        await sock.sendMessage(sender, { text: "✅ Anti-Link protection is now *enabled*!" });

    } else if (command === "off") {
        delete antiLinkSettings[groupId];
        saveAntiLink(antiLinkSettings);
        await sock.sendMessage(sender, { text: "🚫 Anti-Link protection is now *disabled*!" });

    } else {
        await sock.sendMessage(sender, { text: "⚠️ Use:\n- antilink on\n- antilink off" });
    }
};
