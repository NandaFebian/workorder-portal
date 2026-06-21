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
      res.on('end', () => resolve({ status: res.statusCode, data: data }));
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  const loginClient = await request('POST', '/auth/login', { email: 'stress-client1@test.com', password: 'StressTest123!' });
  const clientData = JSON.parse(loginClient.data);
  const clientToken = clientData.data ? clientData.data.token : null;

  console.log('Client Token:', !!clientToken);

  if (clientToken) {
    const profile = await request('GET', '/auth/profile', null, clientToken);
    console.log('/auth/profile:', profile.status, profile.data.substring(0, 100));
    
    const cp = await request('GET', '/customer-pairing', null, clientToken);
    console.log('/customer-pairing:', cp.status, cp.data.substring(0, 100));
  }
}
test();
