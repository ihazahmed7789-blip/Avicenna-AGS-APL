import { useEffect, useState } from "react";
import api from "../../api/client";
import { Card, StatCard, Table, Button } from "../../components/ui";

const REPORTS = [
  ["student-strength","Student Strength"],["admissions","Admissions"],["withdrawals","Withdrawals"],["family","Family / Guardian"],
  ["attendance","Attendance"],["salary","Salary"],["results","Results"],["ptm","PTM Sheet"],["student-cards","Student Cards"],
  ["staff-cards","Staff Cards"],["timetable","Timetable"],["datesheet","Date Sheet"],["certificates","Certificates"]
];

export default function AdminReports() {
  const [r,setR]=useState(null),[salary,setSalary]=useState(null),[active,setActive]=useState(null),[rows,setRows]=useState([]),[loading,setLoading]=useState(false);
  const load=()=>{api.get("/reports/comprehensive").then(x=>setR(x.data));api.get("/reports/salary").then(x=>setSalary(x.data)).catch(()=>{})};
  useEffect(load,[]);
  async function openReport(type) {
    setActive(type); setLoading(true);
    try { setRows((await api.get(`/reports/dataset/${type}`)).data.rows || []); }
    finally { setLoading(false); }
  }
  if(!r)return <Card title="Reports Hub"><p>Loading reports...</p></Card>;
  const columns = rows.length ? Object.keys(rows[0]).filter(k => !["createdAt","updatedAt","id"].includes(k)).slice(0,8).map(k=>({key:k,label:k.replace(/([A-Z])/g," $1")})) : [];
  return <div className="space-y-6">
    <div className="flex justify-between items-center"><h2 className="text-xl font-semibold">Reports Hub</h2><Button variant="secondary" onClick={()=>window.print()}>Print / Save PDF</Button></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Students" value={r.students}/><StatCard label="Active Students" value={r.activeStudents}/><StatCard label="Staff" value={r.staff}/><StatCard label="Withdrawals" value={r.withdrawn} tone="warn"/>
      <StatCard label="Admissions" value={r.admissions}/><StatCard label="Fee Due" value={`PKR ${Number(r.feeDue).toLocaleString()}`}/><StatCard label="Fee Collected" value={`PKR ${Number(r.feePaid).toLocaleString()}`}/><StatCard label="Salary Paid" value={`PKR ${Number(r.salaryPaid).toLocaleString()}`}/>
    </div>
    <Card title="Available Reports">
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
        {REPORTS.map(([type,label])=><Button key={type} variant={active===type?"primary":"secondary"} className="text-left" onClick={()=>openReport(type)}>{label}</Button>)}
      </div>
    </Card>
    {active && <Card title={`${REPORTS.find(x=>x[0]===active)?.[1]} Report`} action={<Button variant="secondary" onClick={()=>window.print()}>Print Report</Button>}>
      {loading ? <p>Loading...</p> : <Table columns={columns} rows={rows} empty="No records found for this report." />}
    </Card>}
    {salary&&<Card title="Salary Summary"><p className="text-sm">Payments: {salary.count} · Total Paid: PKR {Number(salary.totalPaid).toLocaleString()}</p></Card>}
  </div>;
}
