async function fetchPairingCode() {
    try {
        let response = await fetch("/pairing-code");
        let data = await response.json();
        document.getElementById("code-box").innerText = data.code || "No code available";
    } catch (error) {
        console.error("Error fetching code:", error);
    }
}

function refreshCode() {
    fetchPairingCode();
}

fetchPairingCode();
setInterval(fetchPairingCode, 30000); // Refresh every 30s
