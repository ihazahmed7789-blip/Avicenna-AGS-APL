
const {Timetable,DateSheet,Certificate,PTMSheet,Recognition,Leave,AppSetting,Student,Employee}=require("../models");
const {Op}=require("sequelize");
function crud(Model){
 return {
  list: async(req,res)=>{try{res.json(await Model.findAll({order:[["id","DESC"]]}))}catch(e){res.status(500).json({message:"Could not load records",error:e.message})}},
  get: async(req,res)=>{try{const x=await Model.findByPk(req.params.id);if(!x)return res.status(404).json({message:"Record not found"});res.json(x)}catch(e){res.status(500).json({message:e.message})}},
  create: async(req,res)=>{try{res.status(201).json(await Model.create(req.body))}catch(e){res.status(400).json({message:"Could not create record",error:e.message})}},
  update: async(req,res)=>{try{const x=await Model.findByPk(req.params.id);if(!x)return res.status(404).json({message:"Record not found"});await x.update(req.body);res.json(x)}catch(e){res.status(400).json({message:"Could not update record",error:e.message})}},
  remove: async(req,res)=>{try{const x=await Model.findByPk(req.params.id);if(!x)return res.status(404).json({message:"Record not found"});await x.destroy();res.json({message:"Deleted"})}catch(e){res.status(500).json({message:"Could not delete",error:e.message})}}
 }
}
const timetable=crud(Timetable), datesheet=crud(DateSheet), certificates=crud(Certificate), ptm=crud(PTMSheet), recognition=crud(Recognition), leaves=crud(Leave);
async function recognitionList(req,res){try{const rows=await Recognition.findAll({include:[{model:Student,attributes:["fullName","rollNumber","className","section"]}],order:[["awardDate","DESC"]]});res.json(rows)}catch(e){res.status(500).json({message:e.message})}}
async function recognitionCreate(req,res){try{res.status(201).json(await Recognition.create(req.body))}catch(e){res.status(400).json({message:"Could not create recognition",error:e.message})}}
async function settings(req,res){try{if(req.method==="GET"){return res.json(await AppSetting.findAll({order:[["key","ASC"]]}))}for(const [key,value] of Object.entries(req.body||{})){await AppSetting.upsert({key,value:String(value)})}res.json(await AppSetting.findAll({order:[["key","ASC"]]}))}catch(e){res.status(500).json({message:"Settings error",error:e.message})}}
async function classGroups(req,res){try{const {SchoolClass,Section}=require("../models");res.json(await Section.findAll({include:[SchoolClass],order:[["classId","ASC"],["name","ASC"]]}))}catch(e){res.status(500).json({message:e.message})}}
module.exports={timetable,datesheet,certificates,ptm,recognition,leaves,recognitionList,recognitionCreate,settings,classGroups};
