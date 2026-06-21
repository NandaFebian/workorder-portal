const https = require('https');

const BASE = 'https://workorder-production.up.railway.app';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

function request(method, path, body, token) {
  return new Promise((resolve) => {
    const url = new URL(BASE + path);
    const req = https.request(url, {
      method,
      headers: { ...JSON_HEADERS, ...(token ? { Authorization: 'Bearer ' + token } : {}) }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, data: data.substring(0, 100) }));
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  const loginOwner = await request('POST', '/auth/login', { email: 'stress-owner@test.com', password: 'StressTest123!' });
  const ownerToken = JSON.parse(loginOwner.data).data?.token;

  console.log('Owner Token:', !!ownerToken);

  if (ownerToken) {
    const r1 = await request('GET', '/invitations/pending', null, ownerToken);
    console.log('/invitations/pending:', r1.status);
    
    const r2 = await request('GET', '/company/invitations/pending', null, ownerToken);
    console.log('/company/invitations/pending:', r2.status);
  }
}
test();
