const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");

let latestQr = null;
let isReady = false;

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./whatsapp-session" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  },
});

client.on("qr", async (qr) => {
  latestQr = await qrcode.toDataURL(qr); // base64 image, shown once in admin panel
  isReady = false;
  console.log("WhatsApp QR generated — scan it from the admin panel to connect.");
});

client.on("ready", () => {
  isReady = true;
  latestQr = null;
  console.log("WhatsApp client connected and ready.");
});

client.on("disconnected", () => {
  isReady = false;
  console.log("WhatsApp client disconnected.");
});

function initWhatsApp() {
  client.initialize().catch((err) => {
    isReady = false;
    console.error(
      "WhatsApp did not start (this is expected until Chrome/Chromium is available on this machine):",
      err.message
    );
    console.error("The rest of the app will keep working. See README for WhatsApp setup.");
  });
}

function getStatus() {
  return { isReady, qr: latestQr };
}

// Normalizes a local number into WhatsApp's chat-id format.
// Accepts: 03XX-XXXXXXX, 03XXXXXXXXX, 923XXXXXXXXX, +923XXXXXXXXX
function toChatId(number) {
  let digits = String(number).replace(/\D/g, ""); // strip spaces, dashes, +
  if (digits.startsWith("0")) {
    digits = "92" + digits.slice(1); // local 03xx -> 923xx
  } else if (!digits.startsWith("92")) {
    digits = "92" + digits; // assume Pakistani number if no country code given
  }
  return `${digits}@c.us`;
}

// Sends one message. Returns { success, error }
async function sendMessage(number, message) {
  if (!isReady) {
    return { success: false, error: "WhatsApp is not connected. Scan the QR code from the admin panel first." };
  }
  try {
    await client.sendMessage(toChatId(number), message);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Sends to a list of recipients with a delay between each message —
// this is the throttling that keeps the unofficial WhatsApp connection
// from being flagged for sending too fast. Adjust delayMs for your volume.
async function sendBulk(recipients, message, delayMs = 3000) {
  const results = [];
  for (const r of recipients) {
    const outcome = await sendMessage(r.number, message);
    results.push({ number: r.number, label: r.label, ...outcome });
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return results;
}

module.exports = { initWhatsApp, getStatus, sendMessage, sendBulk };
