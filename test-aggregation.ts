import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI_DEV || process.env.MONGO_URI;
  if (!uri) throw new Error("No Mongo URI");
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) return;
  const companyId = '697f3a35d2c36a4e28f4906e';
  
  console.log(`Checking claimed memberships for company ${companyId}`);
  const memberships = await db.collection('membershipcodes').find({ 
    companyId: new mongoose.Types.ObjectId(companyId),
    claimedBy: { $ne: null }
  }).toArray();
  
  if (memberships.length === 0) {
    console.log('No claimed memberships found for this company!');
  } else {
    memberships.forEach(m => {
      console.log(`Code: ${m.code}, isClaimed: ${m.isClaimed}, claimedBy: ${m.claimedBy}`);
    });
  }

  process.exit(0);
}
run();
