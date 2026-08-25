import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { Card, Input, Select, Table, StatCard, Button } from "../../components/ui";

const REPORT_TABS = [
  { key: "strength", label: "Student Strength" },
  { key: "admissions", label: "Admissions" },
  { key: "withdrawals", label: "Withdrawals" },
  { key: "fee", label: "Fee Report" },
  { key: "attendance", label: "Attendance" },
  { key: "results", label: "Results" },
  { key: "salary", label: "Salary" },
];

function exportCSV(filename, rows) {
  if (!rows?.length) return;
  const keys = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const esc = v => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const csv = [keys.join(","), ...rows.map(r => keys.map(k => esc(r[k])).join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}

function ReportActions({ rows, title }) {
  return <div className="flex gap-2 flex-wrap mb-4">
    <Button variant="secondary" disabled={!rows?.length} onClick={() => exportCSV(`${title.replace(/\s+/g, "-").toLowerCase()}.csv`, rows)}>Export Excel (CSV)</Button>
    <Button variant="secondary" disabled={!rows?.length} onClick={() => window.print()}>Print / Save PDF</Button>
  </div>;
}

export default function AdminReports() {
  const [tab, setTab] = useState("strength");
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold">Reports Center</h1><p className="text-sm text-[var(--color-slate)] mt-1">Generate, print and export live school reports.</p></div>
    <div className="flex flex-wrap gap-2 border-b border-[var(--color-line)]">
      {REPORT_TABS.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab===t.key ? "border-[var(--color-brand)] text-[var(--color-brand)]" : "border-transparent text-[var(--color-slate)]"}`}>{t.label}</button>)}
    </div>
    {tab === "strength" && <StrengthReport />}
    {tab === "admissions" && <AdmissionsReport />}
    {tab === "withdrawals" && <WithdrawalsReport />}
    {tab === "fee" && <FeeReport />}
    {tab === "attendance" && <AttendanceReport />}
    {tab === "results" && <ResultsReport />}
    {tab === "salary" && <SalaryReport />}
  </div>;
}

function StrengthReport() {
  const [data,setData]=useState(null),[error,setError]=useState("");
  useEffect(()=>{api.get("/admissions/strength-report").then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message||"Could not generate report."));},[]);
  const rows=useMemo(()=>data?Object.entries(data.byClass).flatMap(([cls,d])=>Object.entries(d.sections).map(([section,total])=>({className:cls,section,total}))):[],[data]);
  return <Card title="Student Strength — Class & Section Wise"><ReportActions rows={rows} title="student-strength"/>{error&&<Error text={error}/>} {data&&<><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"><StatCard label="Total Active Students" value={data.totalStrength}/></div><Table columns={[{key:"className",label:"Class"},{key:"section",label:"Section"},{key:"total",label:"Strength"}]} rows={rows} empty="No active students found."/></>}</Card>;
}

function AdmissionsReport(){const [rows,setRows]=useState([]),[error,setError]=useState("");useEffect(()=>{api.get("/admissions").then(r=>setRows(r.data)).catch(e=>setError(e.response?.data?.message||"Could not generate report."));},[]);return <Card title="Admissions Report"><ReportActions rows={rows} title="admissions"/>{error&&<Error text={error}/>}<Table columns={[{key:"applicantName",label:"Applicant"},{key:"appliedForClass",label:"Class"},{key:"applicationDate",label:"Date"},{key:"status",label:"Status"}]} rows={rows} empty="No admission records."/></Card>}
function WithdrawalsReport(){const [rows,setRows]=useState([]),[error,setError]=useState("");useEffect(()=>{api.get("/students/reports/withdrawals").then(r=>setRows(r.data)).catch(e=>setError(e.response?.data?.message||"Could not generate report."));},[]);return <Card title="Withdrawal Report"><ReportActions rows={rows} title="withdrawals"/>{error&&<Error text={error}/>}<Table columns={[{key:"fullName",label:"Student"},{key:"rollNumber",label:"Roll No."},{key:"className",label:"Class"},{key:"section",label:"Section"},{key:"withdrawalDate",label:"Date"},{key:"withdrawalReason",label:"Reason"}]} rows={rows} empty="No withdrawals recorded."/></Card>}

function FeeReport(){const [month,setMonth]=useState(""),[className,setClassName]=useState(""),[status,setStatus]=useState(""),[classes,setClasses]=useState([]),[rows,setRows]=useState([]),[summary,setSummary]=useState(null),[error,setError]=useState("");useEffect(()=>{api.get("/classes").then(r=>setClasses(r.data)).catch(()=>{});},[]);useEffect(()=>{const params={...(month&&{month}),...(className&&{className}),...(status&&{status})};setError("");Promise.all([api.get("/fees/summary",{params:{...(month&&{month})}}),api.get("/fees",{params})]).then(([a,b])=>{setSummary(a.data);setRows(b.data)}).catch(e=>setError(e.response?.data?.message||"Could not generate fee report."));},[month,className,status]);return <Card title="Fee History — Class / Student / Status Wise"><div className="flex flex-wrap gap-3 mb-4"><Input type="month" value={month} onChange={e=>setMonth(e.target.value)} /><Select value={className} onChange={e=>setClassName(e.target.value)}><option value="">All Classes</option>{classes.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</Select><Select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All Status</option>{["paid","partial","unpaid","overdue"].map(x=><option key={x} value={x}>{x}</option>)}</Select></div>{error&&<Error text={error}/>}<ReportActions rows={rows.map(r=>({student:r.Student?.fullName,rollNo:r.Student?.rollNumber,class:r.Student?.className,section:r.Student?.section,month:r.month,due:r.amountDue,paid:r.amountPaid,status:r.status}))} title="fee-report"/>{summary&&<div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4"><StatCard label="Total Due" value={summary.totalDue}/><StatCard label="Collected" value={summary.totalPaid}/><StatCard label="Paid" value={summary.paidCount}/><StatCard label="Unpaid" value={summary.unpaidCount}/><StatCard label="Overdue" value={summary.overdueCount}/></div>}<Table columns={[{key:"student",label:"Student",render:r=>r.Student?.fullName},{key:"roll",label:"Roll",render:r=>r.Student?.rollNumber},{key:"class",label:"Class",render:r=>r.Student?.className},{key:"section",label:"Section",render:r=>r.Student?.section},{key:"month",label:"Month"},{key:"amountDue",label:"Due"},{key:"amountPaid",label:"Paid"},{key:"status",label:"Status"}]} rows={rows} empty="No fee records found."/></Card>}

function AttendanceReport(){const [personType,setPersonType]=useState("student"),[from,setFrom]=useState(new Date().toISOString().slice(0,8)+"01"),[to,setTo]=useState(new Date().toISOString().slice(0,10)),[report,setReport]=useState(null),[error,setError]=useState("");useEffect(()=>{api.get("/attendance/report",{params:{personType,from,to}}).then(r=>setReport(r.data)).catch(e=>setError(e.response?.data?.message||"Could not generate report."));},[personType,from,to]);const rows=report?[{personType,total:report.total,present:report.present,absent:report.absent,late:report.late,leave:report.leave,shortLeave:report.short_leave}]:[];return <Card title="Attendance Report"><div className="flex flex-wrap gap-3 mb-4"><Select value={personType} onChange={e=>setPersonType(e.target.value)}><option value="student">Students</option><option value="staff">Staff</option></Select><Input type="date" value={from} onChange={e=>setFrom(e.target.value)}/><Input type="date" value={to} onChange={e=>setTo(e.target.value)}/></div>{error&&<Error text={error}/>}<ReportActions rows={rows} title="attendance-report"/>{report&&<div className="grid grid-cols-2 md:grid-cols-6 gap-3"><StatCard label="Total" value={report.total}/><StatCard label="Present" value={report.present}/><StatCard label="Absent" value={report.absent}/><StatCard label="Late" value={report.late}/><StatCard label="Leave" value={report.leave}/><StatCard label="Short Leave" value={report.short_leave}/></div>}</Card>}

function ResultsReport(){const [classes,setClasses]=useState([]),[className,setClassName]=useState(""),[section,setSection]=useState(""),[examName,setExamName]=useState(""),[rows,setRows]=useState([]),[error,setError]=useState("");useEffect(()=>{api.get("/classes").then(r=>setClasses(r.data)).catch(()=>{});},[]);useEffect(()=>{const params={...(className&&{className}),...(examName&&{examName})};api.get("/results",{params}).then(r=>setRows(section?r.data.filter(x=>x.Student?.section===section):r.data)).catch(e=>setError(e.response?.data?.message||"Could not generate result report."));},[className,section,examName]);return <Card title="Result — Class & Section Wise"><div className="flex flex-wrap gap-3 mb-4"><Select value={className} onChange={e=>{setClassName(e.target.value);setSection("")}}><option value="">All Classes</option>{classes.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</Select><Select value={section} onChange={e=>setSection(e.target.value)}><option value="">All Sections</option>{classes.find(c=>c.name===className)?.Sections?.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</Select><Input placeholder="Exam name" value={examName} onChange={e=>setExamName(e.target.value)}/></div>{error&&<Error text={error}/>}<ReportActions rows={rows.map(r=>({student:r.Student?.fullName,rollNo:r.Student?.rollNumber,class:r.Student?.className,section:r.Student?.section,exam:r.examName,subject:r.subject,marks:r.marksObtained,total:r.totalMarks,grade:r.grade}))} title="results"/><Table columns={[{key:"student",label:"Student",render:r=>r.Student?.fullName},{key:"roll",label:"Roll",render:r=>r.Student?.rollNumber},{key:"class",label:"Class",render:r=>r.Student?.className},{key:"section",label:"Section",render:r=>r.Student?.section},{key:"examName",label:"Exam"},{key:"subject",label:"Subject"},{key:"marksObtained",label:"Marks"},{key:"totalMarks",label:"Total"},{key:"grade",label:"Grade"}]} rows={rows} empty="No result records found."/></Card>}

function SalaryReport(){const [month,setMonth]=useState(""),[data,setData]=useState(null),[error,setError]=useState("");useEffect(()=>{api.get("/reports/salary",{params:month?{month}:{}}).then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message||"Could not generate report."));},[month]);const rows=data?.payments||[];return <Card title="Salary Report"><Input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="max-w-xs mb-4"/>{error&&<Error text={error}/>}<ReportActions rows={rows.map(r=>({employee:r.Employee?.fullName,designation:r.Employee?.designation,department:r.Employee?.department,month:r.month,amount:r.amountPaid,status:r.status}))} title="salary-report"/>{data&&<div className="grid grid-cols-2 gap-3 mb-4"><StatCard label="Total Paid" value={data.totalPaid}/><StatCard label="Payments" value={data.count}/></div>}<Table columns={[{key:"employee",label:"Employee",render:r=>r.Employee?.fullName},{key:"month",label:"Month"},{key:"amountPaid",label:"Amount"},{key:"status",label:"Status"}]} rows={rows} empty="No salary payments recorded."/></Card>}
function Error({text}){return <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm mb-4">{text}</div>}
