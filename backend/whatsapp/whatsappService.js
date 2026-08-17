const path = require("path");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const { normalizePakistanWhatsAppNumber } = require("../utils/phone");

let latestQr = null;
let isReady = false;
let isInitializing = false;
let lastError = null;
let connectedNumber = null;
let lastQrAt = null;

const sessionPath = process.env.WHATSAPP_SESSION_PATH || path.join(__dirname, "..", "whatsapp-session");

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "school-erp", dataPath: sessionPath }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  },
});

client.on("qr", async (qr) => {
  latestQr = await qrcode.toDataURL(qr, { width: 320, margin: 2 });
  lastQrAt = new Date().toISOString();
  isReady = false;
  connectedNumber = null;
  lastError = null;
  console.log("WhatsApp QR generated. Scan it from the admin WhatsApp page.");
});

client.on("authenticated", () => {
  lastError = null;
  console.log("WhatsApp authenticated. Session will be reused on restart when persistent storage is available.");
});

client.on("ready", () => {
  isReady = true;
  isInitializing = false;
  latestQr = null;
  lastError = null;
  connectedNumber = client.info?.wid?.user || null;
  console.log(`WhatsApp connected${connectedNumber ? `: ${connectedNumber}` : ""}.`);
});

client.on("auth_failure", (message) => {
  isReady = false;
  isInitializing = false;
  connectedNumber = null;
  lastError = `Authentication failed: ${message}`;
  console.error(lastError);
});

client.on("disconnected", (reason) => {
  isReady = false;
  isInitializing = false;
  connectedNumber = null;
  lastError = `WhatsApp disconnected: ${reason || "unknown reason"}`;
  console.warn(lastError);
});

async function initWhatsApp() {
  if (isReady || isInitializing) return;
  isInitializing = true;
  lastError = null;
  try {
    await client.initialize();
  } catch (err) {
    isReady = false;
    isInitializing = false;
    lastError = err.message;
    console.error("WhatsApp initialization failed:", err.message);
    console.error("The core school ERP remains available. Install Chromium and its dependencies on the host to enable WhatsApp Web.");
  }
}

async function reconnect() {
  if (isReady) return { success: true, message: "WhatsApp is already connected." };
  await initWhatsApp();
  return { success: true, message: "WhatsApp initialization requested." };
}

async function logout() {
  try {
    await client.logout();
  } catch (err) {
    // If there is no active authenticated session, still clear local state.
  }
  isReady = false;
  isInitializing = false;
  latestQr = null;
  connectedNumber = null;
  lastError = null;
  return { success: true };
}

function getStatus() {
  return {
    isReady,
    isInitializing,
    qr: latestQr,
    qrGeneratedAt: lastQrAt,
    connectedNumber,
    error: lastError,
    sessionPath,
  };
}

function toChatId(number) {
  const normalized = normalizePakistanWhatsAppNumber(number);
  if (!normalized) {
    throw new Error("Invalid Pakistan WhatsApp number. Use 03xx-xxxxxxx, 03xxxxxxxxx, 923xxxxxxxxx or +923xxxxxxxxx.");
  }
  return `${normalized}@c.us`;
}

async function sendMessage(number, message) {
  if (!isReady) return { success: false, error: "WhatsApp is not connected. Scan the QR code first." };
  if (!message || !String(message).trim()) return { success: false, error: "Message cannot be empty." };
  try {
    const chatId = toChatId(number);
    await client.sendMessage(chatId, String(message).trim());
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function sendBulk(recipients, message, delayMs = Number(process.env.WHATSAPP_DELAY_MS || 3000)) {
  const results = [];
  for (const r of recipients) {
    const outcome = await sendMessage(r.number, message);
    results.push({ number: r.number, label: r.label, ...outcome });
    if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return results;
}

module.exports = { initWhatsApp, reconnect, logout, getStatus, sendMessage, sendBulk, normalizePakistanWhatsAppNumber };
