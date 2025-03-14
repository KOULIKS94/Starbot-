module.exports = async (sock, sender) => {
    const helpMessage = "📝 *Bot Commands:*\n- ping: Check bot status\n- help: Show this menu\n- menu: Show all commands";
    await sock.sendMessage(sender, { text: helpMessage });
};
