import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Select, Table, Badge } from "../../components/ui";

const TABS = [
  { key: "quicksms", label: "Quick SMS" },
  { key: "visitors", label: "Visitor Log" },
  { key: "complaints", label: "Complaints" },
  { key: "inquiries", label: "Admission Inquiries" },
  { key: "directory", label: "Directory" },
];

export default function AdminFrontdesk() {
  const [tab, setTab] = useState("visitors");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-[var(--color-line)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t.key ? "border-[var(--color-brand)] text-[var(--color-brand)]" : "border-transparent text-[var(--color-slate)] hover:text-[var(--color-ink)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "quicksms" && <QuickSms />}
      {tab === "visitors" && <VisitorLog />}
      {tab === "complaints" && <ComplaintsRegister />}
      {tab === "inquiries" && <AdmissionInquiries />}
      {tab === "directory" && <Directory />}
    </div>
  );
}

function QuickSms() {
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const res = await api.post("/whatsapp/send", { number, message });
      setStatus(res.data.success ? "Sent." : `Failed: ${res.data.error}`);
    } catch (err) {
      setStatus(err.response?.data?.message || "Could not send.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card title="Quick SMS (via WhatsApp)">
      <p className="text-sm text-[var(--color-slate)] mb-4">
        Send an instant one-off WhatsApp message to any number — a parent, staff member, or visitor. For bulk notices to all students, use the WhatsApp tab instead.
      </p>
      <form onSubmit={handleSend} className="space-y-3 max-w-md">
        <Field label="Phone Number"><Input required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="923001234567" /></Field>
        <Field label="Message">
          <textarea required className="w-full border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
        </Field>
        <Button type="submit" disabled={sending}>{sending ? "Sending..." : "Send Message"}</Button>
      </form>
      {status && <p className="text-sm mt-3 text-[var(--color-brand-dark)]">{status}</p>}
    </Card>
  );
}

function VisitorLog() {
  const [visitors, setVisitors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ visitorName: "", phone: "", purpose: "", toMeet: "" });

  function load() {
    api.get("/frontdesk/visitors").then((res) => setVisitors(res.data));
  }
  useEffect(load, []);

  async function handleCheckIn(e) {
    e.preventDefault();
    await api.post("/frontdesk/visitors", form);
    setShowForm(false);
    setForm({ visitorName: "", phone: "", purpose: "", toMeet: "" });
    load();
  }

  async function handleCheckOut(id) {
    await api.put(`/frontdesk/visitors/${id}/checkout`);
    load();
  }

  return (
    <Card title="Visitor Log" action={<Button onClick={() => setShowForm(true)}>+ Check In Visitor</Button>}>
      <Table
        columns={[
          { key: "visitorName", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "toMeet", label: "To Meet" },
          { key: "purpose", label: "Purpose" },
          { key: "checkInTime", label: "In", render: (r) => new Date(r.checkInTime).toLocaleTimeString() },
          { key: "checkOutTime", label: "Out", render: (r) => r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : (
            <button className="text-xs text-[var(--color-brand)] hover:underline" onClick={() => handleCheckOut(r.id)}>Check Out</button>
          ) },
        ]}
        rows={visitors}
        empty="No visitors logged yet."
      />

      {showForm && (
        <FormModal title="Check In Visitor" onClose={() => setShowForm(false)} onSubmit={handleCheckIn}>
          <Field label="Visitor Name"><Input required value={form.visitorName} onChange={(e) => setForm({ ...form, visitorName: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="To Meet"><Input value={form.toMeet} onChange={(e) => setForm({ ...form, toMeet: e.target.value })} placeholder="e.g. Principal" /></Field>
          <Field label="Purpose"><Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></Field>
        </FormModal>
      )}
    </Card>
  );
}

function ComplaintsRegister() {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ complainantName: "", phone: "", subject: "", details: "" });

  function load() {
    api.get("/frontdesk/complaints").then((res) => setComplaints(res.data));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post("/frontdesk/complaints", form);
    setShowForm(false);
    setForm({ complainantName: "", phone: "", subject: "", details: "" });
    load();
  }

  async function handleStatus(id, status) {
    await api.put(`/frontdesk/complaints/${id}`, { status });
    load();
  }

  return (
    <Card title="Complaints Register" action={<Button onClick={() => setShowForm(true)}>+ Log Complaint</Button>}>
      <Table
        columns={[
          { key: "complainantName", label: "From" },
          { key: "subject", label: "Subject" },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          {
            key: "actions",
            label: "",
            render: (r) => r.status !== "resolved" && (
              <div className="flex gap-2">
                {r.status === "open" && <button className="text-xs text-[var(--color-brand)] hover:underline" onClick={() => handleStatus(r.id, "in_progress")}>Start</button>}
                <button className="text-xs text-green-700 hover:underline" onClick={() => handleStatus(r.id, "resolved")}>Resolve</button>
              </div>
            ),
          },
        ]}
        rows={complaints}
        empty="No complaints logged."
      />

      {showForm && (
        <FormModal title="Log Complaint" onClose={() => setShowForm(false)} onSubmit={handleCreate}>
          <Field label="Complainant Name"><Input required value={form.complainantName} onChange={(e) => setForm({ ...form, complainantName: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Subject"><Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
          <Field label="Details">
            <textarea className="w-full border border-[var(--color-line)] rounded-lg px-3 py-2 text-sm" rows={3} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
          </Field>
        </FormModal>
      )}
    </Card>
  );
}

function AdmissionInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ inquirerName: "", phone: "", interestedClass: "", source: "" });

  function load() {
    api.get("/frontdesk/inquiries").then((res) => setInquiries(res.data));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post("/frontdesk/inquiries", form);
    setShowForm(false);
    setForm({ inquirerName: "", phone: "", interestedClass: "", source: "" });
    load();
  }

  async function handleStatus(id, status) {
    await api.put(`/frontdesk/inquiries/${id}`, { status });
    load();
  }

  return (
    <Card title="Admission Inquiries" action={<Button onClick={() => setShowForm(true)}>+ Log Inquiry</Button>}>
      <Table
        columns={[
          { key: "inquirerName", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "interestedClass", label: "Interested Class" },
          { key: "source", label: "Source" },
          { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <Select value={r.status} onChange={(e) => handleStatus(r.id, e.target.value)} className="text-xs py-1">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
                <option value="not_interested">Not Interested</option>
              </Select>
            ),
          },
        ]}
        rows={inquiries}
        empty="No inquiries logged yet."
      />

      {showForm && (
        <FormModal title="Log Admission Inquiry" onClose={() => setShowForm(false)} onSubmit={handleCreate}>
          <Field label="Inquirer Name"><Input required value={form.inquirerName} onChange={(e) => setForm({ ...form, inquirerName: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Interested Class"><Input value={form.interestedClass} onChange={(e) => setForm({ ...form, interestedClass: e.target.value })} /></Field>
          <Field label="Source"><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Walk-in, Referral, Facebook..." /></Field>
        </FormModal>
      )}
    </Card>
  );
}

function Directory() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", note: "" });

  function load() {
    api.get("/frontdesk/directory").then((res) => setEntries(res.data));
  }
  useEffect(load, []);

  const filtered = entries.filter((e) => !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.phone?.includes(search));

  async function handleAdd(e) {
    e.preventDefault();
    await api.post("/frontdesk/directory", form);
    setShowForm(false);
    setForm({ name: "", phone: "", note: "" });
    load();
  }

  async function handleDelete(id) {
    await api.delete(`/frontdesk/directory/${id}`);
    load();
  }

  return (
    <Card title="Phone Directory" action={<Button onClick={() => setShowForm(true)}>+ Add Contact</Button>}>
      <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm mb-4" />
      <Table
        columns={[
          { key: "type", label: "Type", render: (r) => <Badge status={r.type === "Staff" ? "active" : "pending"} /> },
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "note", label: "Note" },
          { key: "actions", label: "", render: (r) => r.manual && <button className="text-xs text-red-600 hover:underline" onClick={() => handleDelete(r.id)}>Remove</button> },
        ]}
        rows={filtered}
        empty="No contacts found."
      />

      {showForm && (
        <FormModal title="Add Directory Contact" onClose={() => setShowForm(false)} onSubmit={handleAdd}>
          <Field label="Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Phone"><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="923001234567" /></Field>
          <Field label="Note (optional)"><Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. Book vendor" /></Field>
        </FormModal>
      )}
    </Card>
  );
}

function FormModal({ title, onClose, onSubmit, children }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="font-semibold mb-4">{title}</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          {children}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
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
