import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workorder');
  const db = mongoose.connection.db;
  if (!db) return;
  const companyId = '697f3a35d2c36a4e28f4906e';
  console.log(`Checking memberships for company ${companyId}`);
  const memberships = await db.collection('membershipcodes').find({ companyId: new mongoose.Types.ObjectId(companyId) }).toArray();
  console.log(memberships);
  process.exit(0);
}
run();
