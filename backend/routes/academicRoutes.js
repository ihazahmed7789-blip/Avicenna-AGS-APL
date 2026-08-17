
const express=require("express"); const router=express.Router();
const c=require("../controllers/academicController"); const {verifyToken,allowRoles}=require("../middleware/auth");
router.use(verifyToken,allowRoles("admin","staff"));
function mount(path,ctrl){router.get(path,ctrl.list);router.post(path,ctrl.create);router.get(path+"/:id",ctrl.get);router.put(path+"/:id",ctrl.update);router.delete(path+"/:id",ctrl.remove)}
mount("/timetable",c.timetable); mount("/datesheet",c.datesheet); mount("/certificates",c.certificates); mount("/ptm",c.ptm); mount("/leaves",c.leaves);
router.get("/recognition",c.recognitionList);router.post("/recognition",c.recognitionCreate);
router.get("/settings",c.settings);router.put("/settings",c.settings);router.get("/class-groups",c.classGroups);
module.exports=router;
