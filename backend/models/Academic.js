
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Timetable = sequelize.define("Timetable", {
  id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
  className:{type:DataTypes.STRING,allowNull:false}, section:{type:DataTypes.STRING},
  day:{type:DataTypes.STRING,allowNull:false}, period:{type:DataTypes.STRING,allowNull:false},
  startTime:{type:DataTypes.STRING}, endTime:{type:DataTypes.STRING},
  subject:{type:DataTypes.STRING,allowNull:false}, teacher:{type:DataTypes.STRING},
  room:{type:DataTypes.STRING}, academicYear:{type:DataTypes.STRING}
});
const DateSheet = sequelize.define("DateSheet", {
  id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
  examName:{type:DataTypes.STRING,allowNull:false}, className:{type:DataTypes.STRING,allowNull:false},
  section:{type:DataTypes.STRING}, subject:{type:DataTypes.STRING,allowNull:false},
  examDate:{type:DataTypes.DATEONLY,allowNull:false}, startTime:{type:DataTypes.STRING},
  endTime:{type:DataTypes.STRING}, room:{type:DataTypes.STRING}, instructions:{type:DataTypes.TEXT}
});
const Certificate = sequelize.define("Certificate", {
  id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
  type:{type:DataTypes.STRING,allowNull:false}, recipientType:{type:DataTypes.ENUM("student","staff"),allowNull:false},
  recipientId:{type:DataTypes.INTEGER,allowNull:false}, certificateNo:{type:DataTypes.STRING,unique:true},
  issueDate:{type:DataTypes.DATEONLY,allowNull:false}, title:{type:DataTypes.STRING},
  body:{type:DataTypes.TEXT,allowNull:false}
});
const PTMSheet = sequelize.define("PTMSheet", {
  id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
  studentId:{type:DataTypes.INTEGER,allowNull:false}, meetingDate:{type:DataTypes.DATEONLY,allowNull:false},
  teacherName:{type:DataTypes.STRING}, parentName:{type:DataTypes.STRING},
  academicPerformance:{type:DataTypes.TEXT}, attendanceRemarks:{type:DataTypes.TEXT},
  behaviorRemarks:{type:DataTypes.TEXT}, parentRemarks:{type:DataTypes.TEXT}, followUpDate:{type:DataTypes.DATEONLY}
});
const Recognition = sequelize.define("Recognition", {
  id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
  studentId:{type:DataTypes.INTEGER,allowNull:false}, period:{type:DataTypes.ENUM("week","month"),allowNull:false},
  periodLabel:{type:DataTypes.STRING,allowNull:false}, reason:{type:DataTypes.TEXT}, awardDate:{type:DataTypes.DATEONLY,allowNull:false}
});
const Leave = sequelize.define("Leave", {
  id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
  personType:{type:DataTypes.ENUM("student","staff"),allowNull:false}, personId:{type:DataTypes.INTEGER,allowNull:false},
  fromDate:{type:DataTypes.DATEONLY,allowNull:false}, toDate:{type:DataTypes.DATEONLY,allowNull:false},
  leaveType:{type:DataTypes.STRING,defaultValue:"Casual"}, reason:{type:DataTypes.TEXT},
  status:{type:DataTypes.ENUM("pending","approved","rejected"),defaultValue:"pending"}, approvedBy:{type:DataTypes.INTEGER}
});
const AppSetting = sequelize.define("AppSetting", {
  id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
  key:{type:DataTypes.STRING,unique:true,allowNull:false}, value:{type:DataTypes.TEXT}
});
module.exports={Timetable,DateSheet,Certificate,PTMSheet,Recognition,Leave,AppSetting};
