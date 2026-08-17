import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Table, Badge } from "../../components/ui";

export default function AdminWhatsApp() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [number, setNumber] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [logs, setLogs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function refreshStatus() {
    try { setStatus((await api.get("/whatsapp/status")).data); } catch (_) {}
  }
  async function loadLogs() {
    try { setLogs((await api.get("/whatsapp/logs")).data); } catch (_) {}
  }

  useEffect(() => {
    refreshStatus();
    loadLogs();
    const interval = setInterval(refreshStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  async function connect() {
    setBusy(true); setResult(null);
    try { await api.post("/whatsapp/connect"); await refreshStatus(); }
    catch (err) { setResult({ error: err.response?.data?.message || "Could not start WhatsApp." }); }
    finally { setBusy(false); }
  }

  async function disconnect() {
    setBusy(true); setResult(null);
    try { await api.post("/whatsapp/disconnect"); await refreshStatus(); }
    catch (err) { setResult({ error: err.response?.data?.message || "Could not disconnect WhatsApp." }); }
    finally { setBusy(false); }
  }

  async function handleSendSingle(e) {
    e.preventDefault(); setBusy(true); setResult(null);
    try { const res = await api.post("/whatsapp/send", { number, message }); setResult(res.data); setNumber(""); setMessage(""); await loadLogs(); }
    catch (err) { setResult({ error: err.response?.data?.message || "Send failed." }); }
    finally { setBusy(false); }
  }

  async function handleSendBulk(e) {
    e.preventDefault(); setBusy(true); setResult(null);
    try { const res = await api.post("/whatsapp/send-to-students", { message, className: className || undefined, section: section || undefined }); setResult(res.data); setMessage(""); await loadLogs(); }
    catch (err) { setResult({ error: err.response?.data?.message || "Send failed." }); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <Card title="WhatsApp Connection">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {status?.isReady ? (
              <>
                <div className="flex items-center gap-2 text-green-700 font-semibold"><span className="w-3 h-3 rounded-full bg-green-500" /> Connected</div>
                <p className="text-sm text-[var(--color-slate)] mt-1">{status.connectedNumber ? `WhatsApp: +${status.connectedNumber}` : "WhatsApp Web session is ready."}</p>
              </>
            ) : status?.qr ? (
              <>
                <div className="font-semibold text-amber-800 mb-1">Scan QR to connect</div>
                <p className="text-sm text-[var(--color-slate)]">WhatsApp → Linked Devices → Link a Device.</p>
              </>
            ) : status?.error ? (
              <><div className="font-semibold text-red-700">WhatsApp unavailable</div><p className="text-sm text-red-600 mt-1">{status.error}</p></>
            ) : (
              <div className="text-sm text-[var(--color-slate)]">WhatsApp is starting. If no QR appears, press Connect again.</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={connect} disabled={busy || status?.isReady}>{busy ? "Working..." : "Connect WhatsApp"}</Button>
            {status?.isReady && <Button onClick={disconnect} disabled={busy}>Disconnect</Button>}
          </div>
        </div>
        {status?.qr && !status?.isReady && (
          <div className="mt-5 flex justify-center bg-white p-4 rounded-xl border border-[var(--color-line)]">
            <img src={status.qr} alt="WhatsApp connection QR code" className="w-72 h-72" />
          </div>
        )}
        {status?.isReady && <p className="mt-4 text-xs text-green-700">Your WhatsApp session is saved on the server and can be reused after a normal application restart when persistent storage is configured.</p>}
      </Card>

      <Card title="Send Direct WhatsApp Message">
        <form onSubmit={handleSendSingle} className="grid md:grid-cols-2 gap-4">
          <Field label="WhatsApp Number"><Input required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="923001234567" /></Field>
          <Field label="Message"><textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm" placeholder="Type your message..." /></Field>
          <div><Button type="submit" disabled={busy || !status?.isReady}>{busy ? "Sending..." : "Send Message"}</Button></div>
        </form>
      </Card>

      <Card title="Send to Students">
        <form onSubmit={handleSendBulk} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Class (optional)"><Input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. 9th" /></Field>
            <Field label="Section (optional)"><Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. A" /></Field>
          </div>
          <Field label="Message"><textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm" placeholder="Fee reminder, result notice, PTM reminder, etc." /></Field>
          <Button type="submit" disabled={busy || !status?.isReady}>{busy ? "Sending..." : "Send to Students"}</Button>
        </form>
      </Card>

      {result && <Card title="Latest Result"><p className={result.error ? "text-red-700" : "text-green-700"}>{result.error || `Sent ${result.sentCount ?? 1} message(s) successfully.`}</p></Card>}

      <Card title="Recent WhatsApp Messages">
        <Table columns={[{ key: "recipientLabel", label: "Recipient" }, { key: "recipientNumber", label: "Number" }, { key: "message", label: "Message", render: (r) => <span className="line-clamp-1 max-w-xs inline-block">{r.message}</span> }, { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> }]} rows={logs} empty="No messages sent yet." />
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">{label}</label>{children}</div>;
}
