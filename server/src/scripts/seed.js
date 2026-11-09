import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { Department, User, Subject, Enrollment } from '../models/index.js';
const db=await connectDB();
try {
  const department=await Department.findOneAndUpdate({code:'CSE'},{name:'Computer Science and Engineering',code:'CSE',isActive:true},{upsert:true,new:true});
  const accounts=[{name:'RVCE Administrator',email:'admin@example.invalid',role:'admin'},{name:'Faculty One',email:'faculty1@example.invalid',role:'teacher'},{name:'Faculty Two',email:'faculty2@example.invalid',role:'teacher'},...Array.from({length:10},(_,i)=>({name:`Student ${String(i+1).padStart(2,'0')}`,email:`student${i+1}@example.invalid`,role:'student',usn:`1RV26CS${String(i+1).padStart(3,'0')}`,semester:3,section:'A',academicYear:'2026-27'}))];
  const users=[];for(const account of accounts){const user=await User.findOneAndUpdate({email:account.email},{$setOnInsert:{...account,department:department._id,isActive:false,approvalStatus:'pending'}},{upsert:true,new:true});users.push(user)}
  const teachers=users.filter(u=>u.role==='teacher'),students=users.filter(u=>u.role==='student');
  const subject=await Subject.findOneAndUpdate({code:'CS301',academicYear:'2026-27'},{name:'Data Structures and Algorithms',code:'CS301',department:department._id,semester:3,academicYear:'2026-27',credits:4,teachers:teachers.map(u=>u._id),coordinator:teachers[0]._id,students:students.map(u=>u._id)},{upsert:true,new:true});
  await Promise.all(students.map(student=>Enrollment.findOneAndUpdate({student:student._id,subject:subject._id},{$setOnInsert:{academicYear:'2026-27',section:'A',active:true}},{upsert:true})));
  console.log(`Seeded ${users.length} inactive example identities, one department and one subject. Provision verified identities securely before use.`);
} finally { await db.close(); }
