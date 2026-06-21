const http = require('k6/http');
const { check } = require('k6');
const { BASE_URL, AUTH, CSV_PATH } = require('../config.js');

const users = open('../' + CSV_PATH).split('\n').slice(1).filter(Boolean).map(line => {
  const [name, email, password, role] = line.split(',');
  return { name, email, password, role };
});

export const options = { vus: 1, iterations: 1 };

export default function () {
  const clients = users.filter((u) => u.role === 'client');
  const clientCreds = [];
  const c = clients[0];
  const res = http.post(${BASE_URL}/auth/login, JSON.stringify({
    email: c.email, password: c.password,
  }), { headers: { 'Content-Type': 'application/json' } });
  
  const token = res.json('data.token');
  const profile = http.get(${BASE_URL}/auth/profile, { headers: { Authorization: token } });
  console.log('auth/profile:', profile.status, profile.body.substring(0, 100));

  const invPending = http.get(${BASE_URL}/company/invitations/pending, { headers: { Authorization: token } });
  console.log('company/invitations/pending:', invPending.status);
}
