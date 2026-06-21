const fs = require('fs');
const path = require('path');

const PASSWORD = 'StressTest123!';
const rows = ['name,email,password,role'];

for (let i = 1; i <= 70; i++) {
  const pad = String(i).padStart(3, '0');
  rows.push(`Client ${pad},stress-client${pad}@test.com,${PASSWORD},client`);
}

for (let i = 1; i <= 15; i++) {
  const pad = String(i).padStart(2, '0');
  rows.push(`Staff ${pad},stress-staff${pad}@test.com,${PASSWORD},staff_unassigned`);
}

for (let i = 1; i <= 10; i++) {
  const pad = String(i).padStart(2, '0');
  rows.push(`Manager ${pad},stress-mgr${pad}@test.com,${PASSWORD},staff_unassigned`);
}

for (let i = 1; i <= 5; i++) {
  rows.push(`Owner ${i},stress-owner${i}@test.com,${PASSWORD},owner`);
}

const csvPath = path.join(__dirname, 'users.csv');
fs.writeFileSync(csvPath, rows.join('\n') + '\n', 'utf-8');
console.log(`Generated ${rows.length - 1} users -> ${csvPath}`);
