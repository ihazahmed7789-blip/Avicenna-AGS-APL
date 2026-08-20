import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Button, Input, Select, Table, Badge, StatCard } from "../../components/ui";

const STATUS_OPTIONS = ["present", "absent", "late", "leave", "short_leave"];

export default function AdminAttendance() {
  const [view, setView] = useState("mark"); // "mark" | "register"
  const [personType, setPersonType] = useState("student");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [people, setPeople] = useState([]);
  const [statuses, setStatuses] = useState({}); // personId -> status
  const [message, setMessage] = useState("");
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);

  const isSunday = new Date(date + "T00:00:00").getDay() === 0;

  if (view === "register") {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setView("mark")} className="text-sm px-3 py-1.5 rounded-lg bg-white border border-[var(--color-line)] hover:bg-gray-50">← Mark Attendance</button>
          <span className="text-sm px-3 py-1.5 rounded-lg bg-[var(--color-brand)] text-white">Attendance Register</span>
        </div>
        <AttendanceRegister />
      </div>
    );
  }

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
        <Button variant="secondary" onClick={() => setView("register")}>View Register</Button>
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

      <Card title={`Mark Attendance — ${date}`} action={<Button onClick={handleSave} disabled={!people.length || isSunday}>Save Attendance</Button>}>
        {isSunday && (
          <div className="bg-amber-50 text-amber-700 text-sm rounded-lg px-3 py-2 mb-4">
            Sunday is a holiday — attendance is not marked on this date.
          </div>
        )}
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

function AttendanceRegister() {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState(null);

  useEffect(() => { api.get("/classes").then((res) => setClasses(res.data)); }, []);

  async function handleLoad() {
    if (!className) return;
    const res = await api.get("/attendance/register", { params: { className, section: section || undefined, month } });
    setData(res.data);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <Card title="Attendance Register">
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Class</label>
            <Select value={className} onChange={(e) => setClassName(e.target.value)} className="w-48">
              <option value="">Select class...</option>
              {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Section (optional)</label>
            <Input value={section} onChange={(e) => setSection(e.target.value)} className="w-32" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">Month</label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" />
          </div>
          <Button onClick={handleLoad} disabled={!className}>Generate</Button>
          {data && <Button variant="secondary" onClick={handlePrint}>Print</Button>}
        </div>
      </Card>

      {data && (
        <Card title={`Register — ${className} ${section || ""} (${month})`}>
          <p className="text-xs text-[var(--color-slate)] mb-3">P = Present, A = Absent, L = Late, V = Leave, S = Short Leave, H = Holiday (Sunday), - = Not marked</p>
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="border border-[var(--color-line)] px-2 py-1 sticky left-0 bg-white">Roll No.</th>
                  <th className="border border-[var(--color-line)] px-2 py-1 sticky left-0 bg-white">Name</th>
                  {Array.from({ length: data.daysInMonth }, (_, i) => (
                    <th key={i} className="border border-[var(--color-line)] px-1.5 py-1">{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.register.map((r) => (
                  <tr key={r.studentId}>
                    <td className="border border-[var(--color-line)] px-2 py-1">{r.rollNumber}</td>
                    <td className="border border-[var(--color-line)] px-2 py-1 whitespace-nowrap">{r.fullName}</td>
                    {Array.from({ length: data.daysInMonth }, (_, i) => (
                      <td key={i} className="border border-[var(--color-line)] px-1.5 py-1 text-center">{r.days[i + 1]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
