
import {useEffect,useState} from "react";
import api from "../../api/client";
import {Card,Button,Input,Select,Table,StatCard,Badge} from "../../components/ui";

const tabs=[
 ["timetable","Timetable"],["datesheet","Date Sheet"],["ptm","PTM Sheet"],["certificates","Certificates"],
 ["recognition","Student of Week / Month"],["leaves","Leaves"],["cards","ID Cards"],["settings","Settings"]
];
const empty={};
function Field({label,children}){return <div><label className="block text-xs font-medium mb-1 text-[var(--color-slate)]">{label}</label>{children}</div>}
function Modal({title,children,onClose}){return <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"><div className="flex justify-between mb-4"><h3 className="font-semibold">{title}</h3><button onClick={onClose}>×</button></div>{children}</div></div>}

export default function AdminAcademic(){
 const [tab,setTab]=useState("timetable");
 return <div className="space-y-5">
  <div className="flex flex-wrap gap-2 border-b border-[var(--color-line)] pb-2">{tabs.map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`px-3 py-2 text-sm rounded-lg ${tab===id?"bg-[var(--color-brand)] text-white":"bg-white border border-[var(--color-line)]"}`}>{label}</button>)}</div>
  {tab==="timetable"&&<Timetable/>}{tab==="datesheet"&&<DateSheet/>}{tab==="ptm"&&<PTM/>}
  {tab==="certificates"&&<Certificates/>}{tab==="recognition"&&<Recognition/>}{tab==="leaves"&&<Leaves/>}
  {tab==="cards"&&<Cards/>}{tab==="settings"&&<Settings/>}
 </div>
}

function GenericTable({title,path,columns,fields,button="+ Add"}){
 const [rows,setRows]=useState([]),[show,setShow]=useState(false),[editingId,setEditingId]=useState(null),[form,setForm]=useState({}),[msg,setMsg]=useState("");
 const load=()=>api.get(`/academic/${path}`).then(r=>setRows(r.data)).catch(e=>setMsg(e.response?.data?.message||"Could not load"));
 useEffect(load,[]);
 async function save(e){e.preventDefault();try{if(editingId){await api.put(`/academic/${path}/${editingId}`,form)}else{await api.post(`/academic/${path}`,form)}setShow(false);setEditingId(null);setForm({});setMsg("Saved successfully.");load()}catch(e){setMsg(e.response?.data?.message||"Could not save")}}
 async function del(id){if(!confirm("Delete this record?"))return;await api.delete(`/academic/${path}/${id}`);load()}
 return <Card title={title} action={<Button onClick={()=>{setEditingId(null);setForm({});setShow(true)}}>{button}</Button>}>
  {msg&&<p className="text-sm bg-[var(--color-brand-light)] text-[var(--color-brand-dark)] p-2 rounded mb-3">{msg}</p>}
  <Table columns={[...columns,{key:"actions",label:"",render:r=><div className="flex gap-2"><button className="text-xs text-[var(--color-brand)]" onClick={()=>{setEditingId(r.id);setForm({...r});setShow(true)}}>Edit</button><button className="text-xs text-red-600" onClick={()=>del(r.id)}>Delete</button></div>}]} rows={rows} empty={`No ${title.toLowerCase()} records yet.`}/>
  {show&&<Modal title={`${editingId?"Edit ":""}${title}`} onClose={()=>setShow(false)}><form onSubmit={save} className="grid grid-cols-2 gap-3">{fields.map(f=><Field key={f.key} label={f.label}><Input required={f.required!==false} type={f.type||"text"} value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})}/></Field>)}<div className="col-span-2 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={()=>setShow(false)}>Cancel</Button><Button>Save</Button></div></form></Modal>}
 </Card>
}

function Timetable(){return <GenericTable title="Timetable" path="timetable" columns={[{key:"className",label:"Class"},{key:"section",label:"Section"},{key:"day",label:"Day"},{key:"period",label:"Period"},{key:"subject",label:"Subject"},{key:"teacher",label:"Teacher"},{key:"startTime",label:"Time"}]} fields={["className","section","day","period","startTime","endTime","subject","teacher","room","academicYear"].map(x=>({key:x,label:x.replace(/([A-Z])/g," $1")}))}/>}

function DateSheet(){return <GenericTable title="Date Sheet" path="datesheet" columns={[{key:"examName",label:"Exam"},{key:"className",label:"Class"},{key:"section",label:"Section"},{key:"subject",label:"Subject"},{key:"examDate",label:"Date"},{key:"startTime",label:"Time"}]} fields={["examName","className","section","subject"].map(x=>({key:x,label:x})) .concat([{key:"examDate",label:"Exam Date",type:"date"},{key:"startTime",label:"Start Time"},{key:"endTime",label:"End Time"},{key:"room",label:"Room"},{key:"instructions",label:"Instructions",required:false}])}/>}

function PTM(){
 const [students,setStudents]=useState([]); const [rows,setRows]=useState([]); const [show,setShow]=useState(false);const [form,setForm]=useState({});
 const load=()=>{api.get("/students").then(r=>setStudents(r.data));api.get("/academic/ptm").then(r=>setRows(r.data))};useEffect(load,[]);
 async function save(e){e.preventDefault();await api.post("/academic/ptm",form);setShow(false);setForm({});load()}
 return <Card title="Parent Teacher Meeting (PTM) Sheet" action={<Button onClick={()=>setShow(true)}>+ Add PTM</Button>}><Table columns={[{key:"studentId",label:"Student ID"},{key:"meetingDate",label:"Date"},{key:"teacherName",label:"Teacher"},{key:"parentName",label:"Parent"},{key:"followUpDate",label:"Follow-up"}]} rows={rows}/>{show&&<Modal title="PTM Record" onClose={()=>setShow(false)}><form className="grid grid-cols-2 gap-3" onSubmit={save}><Field label="Student"><Select required value={form.studentId||""} onChange={e=>setForm({...form,studentId:e.target.value})}><option value="">Select</option>{students.map(s=><option value={s.id} key={s.id}>{s.fullName} — {s.rollNumber}</option>)}</Select></Field>{["meetingDate","teacherName","parentName","academicPerformance","attendanceRemarks","behaviorRemarks","parentRemarks","followUpDate"].map(k=><Field key={k} label={k}><Input type={k.toLowerCase().includes("date")?"date":"text"} value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></Field>)}<div className="col-span-2"><Button>Save PTM</Button></div></form></Modal>}</Card>
}

function Certificates(){
 const [rows,setRows]=useState([]),[show,setShow]=useState(false),[form,setForm]=useState({});
 const load=()=>api.get("/academic/certificates").then(r=>setRows(r.data));useEffect(load,[]);
 async function save(e){e.preventDefault();await api.post("/academic/certificates",{...form,certificateNo:form.certificateNo||`CERT-${Date.now()}`});setShow(false);setForm({});load()}
 return <Card title="Staff / Student Certificates" action={<Button onClick={()=>setShow(true)}>+ Generate Certificate</Button>}><Table columns={[{key:"certificateNo",label:"Certificate No."},{key:"type",label:"Type"},{key:"recipientType",label:"Recipient"},{key:"recipientId",label:"ID"},{key:"issueDate",label:"Issue Date"}]} rows={rows}/>{show&&<Modal title="Generate Certificate" onClose={()=>setShow(false)}><form className="grid grid-cols-2 gap-3" onSubmit={save}>{["type","recipientType","recipientId","issueDate","title"].map(k=><Field key={k} label={k}><Input required={k!=="title"} type={k==="issueDate"?"date":"text"} value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></Field>)}<Field label="Certificate Body"><textarea className="w-full border rounded-lg p-2 text-sm" rows="5" required value={form.body||""} onChange={e=>setForm({...form,body:e.target.value})}/></Field><div><Button>Generate</Button></div></form></Modal>}</Card>
}

function Recognition(){
 const [rows,setRows]=useState([]),[students,setStudents]=useState([]),[show,setShow]=useState(false),[form,setForm]=useState({});
 const load=()=>{api.get("/academic/recognition").then(r=>setRows(r.data));api.get("/students").then(r=>setStudents(r.data))};useEffect(load,[]);
 async function save(e){e.preventDefault();await api.post("/academic/recognition",form);setShow(false);setForm({});load()}
 return <Card title="Student of the Week / Month" action={<Button onClick={()=>setShow(true)}>+ Recognition</Button>}><Table columns={[{key:"student",label:"Student",render:r=>r.Student?.fullName||r.studentId},{key:"period",label:"Award"},{key:"periodLabel",label:"Period"},{key:"reason",label:"Reason"},{key:"awardDate",label:"Date"}]} rows={rows}/>{show&&<Modal title="Student Recognition" onClose={()=>setShow(false)}><form className="space-y-3" onSubmit={save}><Field label="Student"><Select required value={form.studentId||""} onChange={e=>setForm({...form,studentId:e.target.value})}><option value="">Select</option>{students.map(s=><option key={s.id} value={s.id}>{s.fullName} — {s.rollNumber}</option>)}</Select></Field><Field label="Award"><Select value={form.period||"week"} onChange={e=>setForm({...form,period:e.target.value})}><option value="week">Student of the Week</option><option value="month">Student of the Month</option></Select></Field><Field label="Period Label"><Input required value={form.periodLabel||""} onChange={e=>setForm({...form,periodLabel:e.target.value})} placeholder="Week 32 / August 2026"/></Field><Field label="Award Date"><Input type="date" required value={form.awardDate||""} onChange={e=>setForm({...form,awardDate:e.target.value})}/></Field><Field label="Reason"><textarea className="w-full border rounded-lg p-2" rows="4" value={form.reason||""} onChange={e=>setForm({...form,reason:e.target.value})}/></Field><Button>Save</Button></form></Modal>}</Card>
}

function Leaves(){
 const [rows,setRows]=useState([]),[show,setShow]=useState(false),[form,setForm]=useState({personType:"student",status:"pending"});
 const load=()=>api.get("/academic/leaves").then(r=>setRows(r.data));useEffect(load,[]);
 async function update(id,status){await api.put(`/academic/leaves/${id}`,{status});load()}
 async function save(e){e.preventDefault();await api.post("/academic/leaves",form);setShow(false);setForm({personType:"student",status:"pending"});load()}
 return <Card title="Student & Staff Leave Management" action={<Button onClick={()=>setShow(true)}>+ Apply Leave</Button>}><Table columns={[{key:"personType",label:"Type"},{key:"personId",label:"Person ID"},{key:"fromDate",label:"From"},{key:"toDate",label:"To"},{key:"leaveType",label:"Type"},{key:"status",label:"Status",render:r=><Badge status={r.status}/>},{key:"actions",label:"",render:r=><div className="flex gap-2">{r.status==="pending"&&<><button className="text-green-600 text-xs" onClick={()=>update(r.id,"approved")}>Approve</button><button className="text-red-600 text-xs" onClick={()=>update(r.id,"rejected")}>Reject</button></>}</div> }]} rows={rows}/>{show&&<Modal title="Apply Leave" onClose={()=>setShow(false)}><form className="grid grid-cols-2 gap-3" onSubmit={save}>{["personType","personId","fromDate","toDate","leaveType","reason"].map(k=><Field key={k} label={k}><Input required={k!=="reason"} type={k.includes("Date")?"date":"text"} value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></Field>)}<div><Button>Save</Button></div></form></Modal>}</Card>
}

function Cards(){
 const [type,setType]=useState("student"),[rows,setRows]=useState([]);
 useEffect(()=>{api.get(type==="student"?"/students":"/employees").then(r=>setRows(r.data))},[type]);
 return <Card title="Printable ID Cards"><div className="flex gap-2 mb-4"><Button variant={type==="student"?"primary":"secondary"} onClick={()=>setType("student")}>Student Cards</Button><Button variant={type==="staff"?"primary":"secondary"} onClick={()=>setType("staff")}>Staff Cards</Button><Button variant="secondary" onClick={()=>window.print()}>Print</Button></div><div className="grid md:grid-cols-3 gap-4">{rows.map(r=><div key={r.id} className="border-2 rounded-xl p-4 bg-white print:border-black"><p className="font-bold text-[var(--color-brand)]">AVICENNA APL</p><p className="font-semibold mt-3">{r.fullName}</p><p className="text-xs">{type==="student"?`Roll: ${r.rollNumber} • ${r.className} ${r.section||""}`:`${r.employeeCode} • ${r.designation||""}`}</p><p className="text-xs mt-2">{r.phone||r.guardianPhone||""}</p></div>)}</div></Card>
}
function Settings(){
 const [rows,setRows]=useState([]),[form,setForm]=useState({schoolName:"Avicenna APL",schoolPhone:"",schoolAddress:"",academicYear:"2026-27",currency:"PKR",feeDueDay:"10"});
 useEffect(()=>api.get("/academic/settings").then(r=>{setRows(r.data);const o={...form};r.data.forEach(x=>o[x.key]=x.value);setForm(o)}),[]);
 async function save(e){e.preventDefault();await api.put("/academic/settings",form);alert("Settings saved")}
 return <Card title="School / System Settings"><form className="grid md:grid-cols-2 gap-4" onSubmit={save}>{Object.keys(form).map(k=><Field key={k} label={k}><Input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></Field>)}<div><Button>Save Settings</Button></div></form></Card>
}
