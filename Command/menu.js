const menuText = `
*🌟 Lyfe Bot - WhatsApp Bot Menu 🌟*

📌 *General Commands:*
- 🎭 *!sticker* - Create a sticker from an image or video
- 📸 *!toimg* - Convert sticker to an image
- 🔄 *!restart* - Restart the bot
- 🎵 *!play <song name>* - Download a song from YouTube

📌 *Group Management:*
- 👮 *!antilink on/off* - Block links in the group
- 👥 *!kick @user* - Remove a member from the group
- 🎭 *!promote @user* - Make a user admin
- 🎭 *!demote @user* - Remove admin rights

📌 *Other Features:*
- 🔎 *!ytsearch <query>* - Search for YouTube videos
- 🎤 *!tts <text>* - Convert text to speech
- 📩 *!quote* - Get a random quote

🚀 *Bot Created by Your Name*
`;

const menu = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { text: menuText }, { quoted: msg });
};

module.exports = menu;
