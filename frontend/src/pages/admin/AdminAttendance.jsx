import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Select, Table, Badge, StatCard } from "../../components/ui";

const STATUS_OPTIONS = ["present", "absent", "late", "leave", "short_leave"];

export default function AdminAttendance() {
  const [personType, setPersonType] = useState("student");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [people, setPeople] = useState([]);
  const [statuses, setStatuses] = useState({}); // personId -> status
  const [message, setMessage] = useState("");
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);

  function loadPeople() {
    const endpoint = personType === "student" ? "/students" : "/employees";
    api.get(endpoint).then((res) => {
      setPeople(res.data);
      const initial = {};
      res.data.forEach((p) => (initial[p.id] = "present"));
      setStatuses(initial);
    });
  }

  function loadHistory() {
    api.get("/attendance", { params: { personType, date } }).then((res) => setHistory(res.data));
  }

  function loadReport() {
    const from = date.slice(0, 8) + "01";
    api.get("/attendance/report", { params: { personType, from, to: date } }).then((res) => setReport(res.data));
  }

  useEffect(() => {
    loadPeople();
    loadHistory();
    loadReport();
  }, [personType, date]);

  async function handleSave() {
    const records = people.map((p) => ({ personId: p.id, status: statuses[p.id] || "present" }));
    try {
      await api.post("/attendance/mark", { personType, date, records });
      setMessage(`Attendance saved for ${records.length} ${personType === "student" ? "students" : "staff members"}.`);
      loadHistory();
      loadReport();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save attendance.");
    }
  }

  return (
    <div className="space-y-6">
      {message && <div className="bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] text-sm rounded-lg px-3 py-2">{message}</div>}

      <div className="flex gap-3 items-end">
        <div>
          <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Marking For</label>
          <Select value={personType} onChange={(e) => setPersonType(e.target.value)} className="w-40">
            <option value="student">Students</option>
            <option value="staff">Staff</option>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Present (month)" value={report.present} />
          <StatCard label="Absent (month)" value={report.absent} tone="warn" />
          <StatCard label="Late" value={report.late} tone="accent" />
          <StatCard label="Leave" value={report.leave} />
          <StatCard label="Short Leave" value={report.short_leave} />
        </div>
      )}

      <Card title={`Mark Attendance — ${date}`} action={<Button onClick={handleSave} disabled={!people.length}>Save Attendance</Button>}>
        {!people.length ? (
          <p className="text-sm text-[var(--color-slate)] py-6 text-center">
            No {personType === "student" ? "students" : "staff"} found yet.
          </p>
        ) : (
          <div className="space-y-2">
            {people.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-[var(--color-line)]/60 py-2">
                <span className="text-sm">{p.fullName} <span className="text-[var(--color-slate)]">({p.rollNumber || p.employeeCode})</span></span>
                <div className="flex gap-1">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatuses({ ...statuses, [p.id]: s })}
                      className={`text-xs px-2 py-1 rounded-full capitalize border ${
                        statuses[p.id] === s
                          ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                          : "bg-white text-[var(--color-slate)] border-[var(--color-line)] hover:bg-gray-50"
                      }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title={`Already Marked — ${date}`}>
        <Table
          columns={[
            { key: "personName", label: "Name" },
            { key: "status", label: "Status", render: (r) => <Badge status={r.status} /> },
            { key: "remarks", label: "Remarks" },
          ]}
          rows={history}
          empty="Nothing marked for this date yet."
        />
      </Card>
    </div>
  );
}
