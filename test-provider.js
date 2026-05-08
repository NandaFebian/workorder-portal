// Quick interoperability test against the live FAQ provider
const https = require('https');

const BASE = 'https://ta-faq-service.vercel.app';

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      method,
      hostname: url.hostname,
      path: url.pathname,
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        console.log(`\n=== ${method} ${path} => ${res.statusCode} ===`);
        try { console.log(JSON.stringify(JSON.parse(data), null, 2)); }
        catch { console.log(data); }
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // 1. Test register
  console.log('\n>>> Testing POST /faq/register');
  const reg = await request('POST', '/faq/register', { company_name: 'interop_test_' + Date.now() });
  const apiKey = reg.data?.company?.apiKey || reg.data?.company?.api_key;
  console.log('API Key obtained:', apiKey ? 'YES' : 'NO');

  if (!apiKey) {
    console.log('Cannot continue without API key');
    return;
  }

  // 2. Test upload text
  console.log('\n>>> Testing POST /faq/upload/text');
  await request('POST', '/faq/upload/text', { title: 'Test Doc', content: 'This is a test document for interop checking.' }, { 'x-api-key': apiKey });

  // 3. Test get documents
  console.log('\n>>> Testing GET /faq/documents');
  await request('GET', '/faq/documents', null, { 'x-api-key': apiKey });

  // 4. Test ask
  console.log('\n>>> Testing POST /faq/ask');
  await request('POST', '/faq/ask', { question: 'What is this about?' }, { 'x-api-key': apiKey });

  console.log('\n>>> All tests complete!');
}

main().catch(console.error);
