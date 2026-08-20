import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, Input, Table, StatCard } from "../../components/ui";

const REPORT_TABS = [
  { key: "strength", label: "Student Strength" },
  { key: "admissions", label: "Admissions" },
  { key: "withdrawals", label: "Withdrawals" },
  { key: "fee", label: "Fee Report" },
  { key: "attendance", label: "Attendance" },
  { key: "salary", label: "Salary" },
];

export default function AdminReports() {
  const [tab, setTab] = useState("strength");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-line)]">
        {REPORT_TABS.map((t) => (
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

      {tab === "strength" && <StrengthReport />}
      {tab === "admissions" && <AdmissionsReport />}
      {tab === "withdrawals" && <WithdrawalsReport />}
      {tab === "fee" && <FeeReport />}
      {tab === "attendance" && <AttendanceReport />}
      {tab === "salary" && <SalaryReport />}
    </div>
  );
}

function StrengthReport() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/admissions/strength-report").then((res) => setData(res.data)); }, []);
  if (!data) return null;
  return (
    <Card title="Student Strength">
      <p className="text-sm text-[var(--color-slate)] mb-3">Total active students: <span className="font-semibold text-[var(--color-ink)]">{data.totalStrength}</span></p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(data.byClass).map(([cls, d]) => (
          <div key={cls} className="border border-[var(--color-line)] rounded-lg p-3">
            <p className="text-sm font-medium">{cls}</p>
            <p className="text-lg font-semibold text-[var(--color-brand)]">{d.total}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AdmissionsReport() {
  const [admissions, setAdmissions] = useState([]);
  useEffect(() => { api.get("/admissions").then((res) => setAdmissions(res.data)); }, []);
  return (
    <Card title="Admissions Report">
      <Table
        columns={[
          { key: "applicantName", label: "Applicant" },
          { key: "appliedForClass", label: "Class" },
          { key: "applicationDate", label: "Date" },
          { key: "status", label: "Status" },
        ]}
        rows={admissions}
        empty="No admission records."
      />
    </Card>
  );
}

function WithdrawalsReport() {
  const [students, setStudents] = useState([]);
  useEffect(() => { api.get("/students/reports/withdrawals").then((res) => setStudents(res.data)); }, []);
  return (
    <Card title="Withdrawal Report">
      <Table
        columns={[
          { key: "fullName", label: "Student" },
          { key: "rollNumber", label: "Roll No." },
          { key: "className", label: "Class" },
          { key: "withdrawalDate", label: "Date" },
          { key: "withdrawalReason", label: "Reason" },
        ]}
        rows={students}
        empty="No withdrawals recorded."
      />
    </Card>
  );
}

function FeeReport() {
  const [month, setMonth] = useState("");
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const params = month ? { month } : {};
    api.get("/fees/summary", { params }).then((res) => setSummary(res.data));
    api.get("/fees", { params }).then((res) => setRecords(res.data));
  }, [month]);

  return (
    <Card title="Fee Report">
      <Input placeholder="Filter by month, e.g. 2026-08" value={month} onChange={(e) => setMonth(e.target.value)} className="max-w-xs mb-4" />
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard label="Total Due" value={summary.totalDue} />
          <StatCard label="Total Collected" value={summary.totalPaid} />
          <StatCard label="Unpaid" value={summary.unpaidCount || 0} tone="warn" />
          <StatCard label="Overdue" value={summary.overdueCount || 0} tone="warn" />
        </div>
      )}
      <Table
        columns={[
          { key: "student", label: "Student", render: (r) => r.Student?.fullName },
          { key: "month", label: "Month" },
          { key: "amountDue", label: "Due" },
          { key: "amountPaid", label: "Paid" },
          { key: "status", label: "Status" },
        ]}
        rows={records}
        empty="No fee records."
      />
    </Card>
  );
}

function AttendanceReport() {
  const [personType, setPersonType] = useState("student");
  const [report, setReport] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + "01";

  useEffect(() => {
    api.get("/attendance/report", { params: { personType, from: monthStart, to: today } }).then((res) => setReport(res.data));
  }, [personType]);

  return (
    <Card title="Attendance Report (This Month)">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setPersonType("student")} className={`px-3 py-1 rounded-lg text-sm ${personType === "student" ? "bg-[var(--color-brand)] text-white" : "bg-gray-100"}`}>Students</button>
        <button onClick={() => setPersonType("staff")} className={`px-3 py-1 rounded-lg text-sm ${personType === "staff" ? "bg-[var(--color-brand)] text-white" : "bg-gray-100"}`}>Staff</button>
      </div>
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Present" value={report.present} />
          <StatCard label="Absent" value={report.absent} tone="warn" />
          <StatCard label="Late" value={report.late} tone="accent" />
          <StatCard label="Leave" value={report.leave} />
          <StatCard label="Short Leave" value={report.short_leave} />
        </div>
      )}
    </Card>
  );
}

function SalaryReport() {
  const [month, setMonth] = useState("");
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/reports/salary", { params: month ? { month } : {} }).then((res) => setData(res.data)); }, [month]);

  return (
    <Card title="Salary Report">
      <Input placeholder="Filter by month, e.g. 2026-08" value={month} onChange={(e) => setMonth(e.target.value)} className="max-w-xs mb-4" />
      {data && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Total Paid" value={data.totalPaid} />
          <StatCard label="Payments" value={data.count} />
        </div>
      )}
      <Table
        columns={[
          { key: "employee", label: "Employee", render: (r) => r.Employee?.fullName },
          { key: "month", label: "Month" },
          { key: "amountPaid", label: "Amount" },
          { key: "status", label: "Status" },
        ]}
        rows={data?.payments || []}
        empty="No salary payments recorded."
      />
    </Card>
  );
}
