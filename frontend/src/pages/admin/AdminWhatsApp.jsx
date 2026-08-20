import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Table, Badge } from "../../components/ui";

export default function AdminWhatsApp() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [logs, setLogs] = useState([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  function refreshStatus() {
    api.get("/whatsapp/status").then((res) => setStatus(res.data)).catch(() => {});
  }
  function loadLogs() {
    api.get("/whatsapp/logs").then((res) => setLogs(res.data)).catch(() => {});
  }

  useEffect(() => {
    refreshStatus();
    loadLogs();
    const interval = setInterval(refreshStatus, 5000); // poll for QR / ready state
    return () => clearInterval(interval);
  }, []);

  async function handleSendBulk(e) {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await api.post("/whatsapp/send-to-students", { message, className: className || undefined, section: section || undefined });
      setResult(res.data);
      loadLogs();
    } catch (err) {
      setResult({ error: err.response?.data?.message || "Send failed." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Connection Status">
        {status?.isReady ? (
          <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500" /> WhatsApp is connected and ready to send messages.
          </div>
        ) : status?.qr ? (
          <div className="text-sm text-[var(--color-slate)]">
            <p className="mb-3">Scan this QR code with WhatsApp on the phone you want to use for notifications (WhatsApp → Linked Devices → Link a Device):</p>
            <img src={status.qr} alt="WhatsApp QR code" className="w-56 h-56 border border-[var(--color-line)] rounded-lg" />
          </div>
        ) : (
          <p className="text-sm text-[var(--color-slate)]">
            Waiting for WhatsApp to initialize... If this doesn't produce a QR code, make sure Chrome/Chromium is installed on the server (see README).
          </p>
        )}
      </Card>

      <Card title="Send Notification to Students">
        <form onSubmit={handleSendBulk} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Class (optional — leave blank for all)"><Input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. 9th" /></Field>
            <Field label="Section (optional)"><Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. A" /></Field>
          </div>
          <Field label="Message">
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/40"
              placeholder="e.g. Reminder: August fee is due by the 10th."
            />
          </Field>
          <Button type="submit" disabled={sending || !status?.isReady}>
            {sending ? "Sending..." : "Send to Students"}
          </Button>
          {!status?.isReady && <p className="text-xs text-amber-700">Connect WhatsApp above before sending.</p>}
        </form>

        {result && (
          <div className="mt-4 text-sm">
            {result.error ? (
              <p className="text-red-700">{result.error}</p>
            ) : (
              <p className="text-[var(--color-brand-dark)]">
                Sent to {result.sentCount} of {result.totalRecipients} recipients.
                {result.failedCount > 0 && ` ${result.failedCount} failed.`}
              </p>
            )}
          </div>
        )}
      </Card>

      <Card title="Recent Messages">
        <Table
          columns={[
            { key: "recipientLabel", label: "Recipient" },
            { key: "recipientNumber", label: "Number" },
            { key: "message", label: "Message", render: (r) => <span className="line-clamp-1 max-w-xs inline-block">{r.message}</span> },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          ]}
          rows={logs}
          empty="No messages sent yet."
        />
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">{label}</label>
      {children}
    </div>
  );
}
