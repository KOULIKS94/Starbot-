const express = require("render");
const startBot = require("./index");

const app = render();

app.get("/", (req, res) => {
    res.send("WhatsApp Bot is Running! 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌍 Server running on port ${PORT}`);
});

// Start the bot
startBot();
