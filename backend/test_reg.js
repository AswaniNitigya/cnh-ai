const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: "Debug Test",
      email: `debug_${Date.now()}@example.com`,
      password: "password123",
      role: "student"
    });
    console.log("SUCCESS:", res.data);
  } catch (e) {
    console.log("ERROR:", e.response?.data || e.message);
  }
})();
