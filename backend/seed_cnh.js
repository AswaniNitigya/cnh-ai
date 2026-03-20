require('dotenv').config();
const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5000/api';

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('Please provide ADMIN_EMAIL and ADMIN_PASSWORD in your environment to run the seed script.');
    return;
  }

  // Login as admin
  const { data: auth } = await axios.post(`${API}/auth/login`, {
    email: adminEmail,
    password: adminPassword,
  });
  
  const token = auth.token;
  console.log('Logged in as:', auth.user.name);

  const headers = { Authorization: `Bearer ${token}` };

  // Remove hardcoded mock notices for production
  const notices = [];

  for (const notice of notices) {
    const { data } = await axios.post(`${API}/notices/manual`, notice, { headers });
    console.log('Created:', data.notice.title);
  }

  console.log('\nDone! Created', notices.length, 'sample notices.');
}

seed().catch(err => {
  console.error('Seed error:', err.response?.data?.error || err.message);
});
