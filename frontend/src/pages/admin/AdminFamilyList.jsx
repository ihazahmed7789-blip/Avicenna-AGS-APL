import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Input, Button } from "../../components/ui";

export default function AdminFamilyList() {
  const [families, setFamilies] = useState([]);
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState(null);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");

  const load = () => api.get("/students/family-list").then((res) => setFamilies(res.data));
  useEffect(load, []);

  const filtered = families.filter((f) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return f.guardianName?.toLowerCase().includes(term) || f.guardianPhone?.includes(term) ||
      f.familyNumber?.toLowerCase().includes(term) || f.students.some((s) => s.fullName.toLowerCase().includes(term));
  });

  async function send(e) {
    e.preventDefault(); setResult("");
    try {
      const res = await api.post("/whatsapp/send-to-family", { familyNumber: target.familyNumber, message });
      setResult(`Sent ${res.data.sentCount} message(s). ${res.data.failedCount ? `${res.data.failedCount} failed.` : ""}`);
      setMessage("");
    } catch (err) { setResult(err.response?.data?.message || "Message failed."); }
  }

  return <div className="space-y-6">
    <Card title="Family List">
      <p className="text-sm text-[var(--color-slate)] mb-4">Families are grouped by Family Number. Each family can receive one combined WhatsApp notice.</p>
      <Input placeholder="Search by guardian name, phone, family or student..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-lg mb-4" />
      <div className="space-y-3">
        {filtered.map((f, i) => <div key={i} className="border border-[var(--color-line)] rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{f.guardianName || "Guardian not set"}</p>
              <p className="text-xs text-[var(--color-slate)]">{f.familyNumber ? `Family #${f.familyNumber}` : "No family number"} · {f.guardianPhone || "No phone"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] px-2 py-1 rounded-full">{f.students.length} {f.students.length === 1 ? "child" : "children"}</span>
              {f.familyNumber && (f.guardianPhone || f.students.some(s => s.guardianPhone)) && <Button className="text-xs px-3 py-1.5" onClick={() => setTarget(f)}>Send Message</Button>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">{f.students.map((s) => <span key={s.id} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{s.fullName} ({s.rollNumber}, {s.className})</span>)}</div>
        </div>)}
        {!filtered.length && <p className="text-sm text-[var(--color-slate)] text-center py-6">No families found.</p>}
      </div>
    </Card>

    {target && <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between mb-4"><h3 className="font-semibold">Message Family {target.familyNumber}</h3><button onClick={() => setTarget(null)}>×</button></div>
        <form onSubmit={send} className="space-y-4">
          <textarea required rows={6} value={message} onChange={e => setMessage(e.target.value)} className="w-full border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm" placeholder="Fee reminder, result notice, PTM reminder..." />
          <div className="flex items-center gap-3"><Button>Send to Family</Button><Button type="button" variant="secondary" onClick={() => setTarget(null)}>Close</Button></div>
          {result && <p className="text-sm text-[var(--color-slate)]">{result}</p>}
        </form>
      </div>
    </div>}
  </div>;
}
