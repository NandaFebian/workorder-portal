const fs = require('fs');
const path = require('path');

const PASSWORD = 'StressTest123!';
const rows = ['name,email,password,role'];

for (let i = 1; i <= 100; i++) {
  const pad = String(i).padStart(3, '0');
  rows.push(`Client ${pad},stress-client${pad}@test.com,${PASSWORD},client`);
}

const csvPath = path.join(__dirname, 'users.csv');
fs.writeFileSync(csvPath, rows.join('\n') + '\n', 'utf-8');
console.log(`Generated ${rows.length - 1} users -> ${csvPath}`);
