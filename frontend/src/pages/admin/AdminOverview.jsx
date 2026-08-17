import { useEffect, useState } from "react";
import api from "../../api/client";
import { StatCard, Card, Table } from "../../components/ui";

export default function AdminOverview() {
  const [s, setS] = useState(null), [awards, setAwards] = useState([]), [err, setErr] = useState("");
  useEffect(() => {
    api.get("/reports/dashboard-summary").then(r => setS(r.data)).catch(e => setErr(e.response?.data?.message || "Could not load dashboard."));
    api.get("/academic/recognition").then(r => setAwards(r.data)).catch(() => {});
  }, []);
  return <div className="space-y-6">
    {err && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{err}</div>}
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
      <StatCard label="Active Students" value={s?.totalStudents ?? "—"} />
      <StatCard label="Active Staff" value={s?.totalEmployees ?? "—"} />
      <StatCard label="Admissions" value={s?.admissions ?? "—"} />
      <StatCard label="Pending Admissions" value={s?.pendingAdmissions ?? "—"} tone="accent" />
      <StatCard label="Withdrawn" value={s?.withdrawnStudents ?? "—"} tone="warn" />
      <StatCard label="Overdue Fees" value={s?.overdueFees ?? "—"} tone="warn" />
      <StatCard label="Fee Due" value={s ? `PKR ${Number(s.totalFees).toLocaleString()}` : "—"} />
      <StatCard label="Fee Collected" value={s ? `PKR ${Number(s.collectedFees).toLocaleString()}` : "—"} />
      <StatCard label="Attendance Today" value={s?.attendanceToday ?? "—"} />
      <StatCard label="Present Today" value={s?.presentToday ?? "—"} />
      <StatCard label="Visitors Today" value={s?.visitorsToday ?? "—"} />
      <StatCard label="Open Complaints" value={s?.openComplaints ?? "—"} tone="warn" />
      <StatCard label="New Inquiries" value={s?.newInquiries ?? "—"} tone="accent" />
      <StatCard label="Upcoming Exams" value={s?.dateSheetUpcoming ?? "—"} />
      <StatCard label="Upcoming PTM" value={s?.ptmUpcoming ?? "—"} />
      <StatCard label="Timetable Entries" value={s?.timetableCount ?? "—"} />
    </div>
    <div className="grid lg:grid-cols-2 gap-5">
      <Card title="School Overview">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Fee collection" value={s ? `PKR ${Number(s.collectedFees).toLocaleString()}` : "—"} />
          <Metric label="Outstanding" value={s ? `PKR ${(Number(s.totalFees)-Number(s.collectedFees)).toLocaleString()}` : "—"} />
          <Metric label="Present today" value={s?.presentToday ?? "—"} />
          <Metric label="New inquiries" value={s?.newInquiries ?? "—"} />
        </div>
      </Card>
      <Card title="Student of the Week / Month">
        <Table columns={[{key:"student",label:"Student",render:r=>r.Student?.fullName||r.studentId},{key:"period",label:"Award"},{key:"periodLabel",label:"Period"},{key:"awardDate",label:"Date"}]} rows={awards.slice(0,5)} empty="No recognition entries yet." />
      </Card>
    </div>
  </div>;
}
function Metric({label,value}) { return <div className="border border-[var(--color-line)] rounded-lg p-3"><p className="text-xs text-[var(--color-slate)]">{label}</p><p className="font-semibold mt-1">{value}</p></div>; }
