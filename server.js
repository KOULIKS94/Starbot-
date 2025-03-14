const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.static("web"));

app.get("/pairing-code", (req, res) => {
    const data = fs.readFileSync("./web/pairing_code.json", "utf8");
    res.json(JSON.parse(data));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌍 Website running at: http://localhost:${PORT}`);
});
