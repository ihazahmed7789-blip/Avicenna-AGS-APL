import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Input, Button } from "../../components/ui";

export default function AdminFamilyList() {
  const [families, setFamilies] = useState([]);
  const [search, setSearch] = useState("");
  const [messagingKey, setMessagingKey] = useState(null); // which family's compose box is open
  const [messageText, setMessageText] = useState("");
  const [status, setStatus] = useState({});

  function load() {
    api.get("/students/family-list").then((res) => setFamilies(res.data));
  }
  useEffect(load, []);

  const filtered = families.filter((f) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      f.guardianName?.toLowerCase().includes(term) ||
      f.guardianPhone?.includes(term) ||
      f.familyNumber?.toLowerCase().includes(term) ||
      f.students.some((s) => s.fullName.toLowerCase().includes(term))
    );
  });

  async function handleSend(family, key) {
    if (!family.guardianPhone) {
      setStatus({ ...status, [key]: "No guardian phone number on file." });
      return;
    }
    if (!messageText) return;
    setStatus({ ...status, [key]: "Sending..." });
    try {
      const res = await api.post("/whatsapp/send", { number: family.guardianPhone, message: messageText });
      setStatus({ ...status, [key]: res.data.success ? "Sent." : `Failed: ${res.data.error}` });
      if (res.data.success) {
        setMessagingKey(null);
        setMessageText("");
      }
    } catch (err) {
      setStatus({ ...status, [key]: err.response?.data?.message || "Could not send." });
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Family List">
        <p className="text-sm text-[var(--color-slate)] mb-4">
          Students sharing the same Family Number appear grouped here — useful for combined fee notices or messaging a whole family at once.
          Set a Family Number when adding/editing a student to group siblings together.
        </p>
        <Input placeholder="Search by guardian name, phone, or student..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm mb-4" />

        <div className="space-y-3">
          {filtered.map((f, i) => {
            const key = f.familyNumber || `no-family-${i}`;
            return (
              <div key={key} className="border border-[var(--color-line)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{f.guardianName || "Guardian not set"}</p>
                    <p className="text-xs text-[var(--color-slate)]">
                      {f.familyNumber ? `Family #${f.familyNumber}` : "No family number"} · {f.guardianPhone || "No phone"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] px-2 py-1 rounded-full">
                      {f.students.length} {f.students.length === 1 ? "child" : "children"}
                    </span>
                    <Button
                      variant="secondary"
                      className="text-xs px-3 py-1"
                      onClick={() => { setMessagingKey(messagingKey === key ? null : key); setMessageText(""); }}
                    >
                      Message
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {f.students.map((s) => (
                    <span key={s.id} className="text-xs bg-gray-100 text-[var(--color-ink)] px-2 py-1 rounded-full">
                      {s.fullName} ({s.rollNumber}, {s.className})
                    </span>
                  ))}
                </div>

                {messagingKey === key && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-line)]">
                    <textarea
                      className="w-full border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm"
                      rows={3}
                      placeholder={`Message to ${f.guardianName || "guardian"} (${f.guardianPhone || "no phone"})`}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <Button onClick={() => handleSend(f, key)} disabled={!messageText}>Send</Button>
                      {status[key] && <span className="text-xs text-[var(--color-slate)]">{status[key]}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!filtered.length && <p className="text-sm text-[var(--color-slate)] text-center py-6">No families found.</p>}
        </div>
      </Card>
    </div>
  );
}
