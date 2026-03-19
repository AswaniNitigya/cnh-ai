const axios = require('axios');

const API = 'http://localhost:5000/api';

async function seed() {
  // Login as admin
  const { data: auth } = await axios.post(`${API}/auth/login`, {
    email: 'admin@mmmut.ac.in',
    password: 'admin123',
  });
  const token = auth.token;
  console.log('Logged in as:', auth.user.name);

  const headers = { Authorization: `Bearer ${token}` };

  const notices = [
    {
      title: 'End Semester Examination Schedule - Spring 2027',
      content: 'All students are hereby informed that the End Semester Examinations for Spring 2027 will commence from May 5, 2027. The detailed schedule will be published on the university portal. Students must ensure their examination forms are submitted by April 15, 2027.\n\nVenue: Examination Hall 101, 102\nReporting Time: 9:00 AM\n\nStudents are advised to carry their admit cards and university ID cards.',
      category: 'exam',
      target_criteria: { branch: 'CSE', year: '2027' },
    },
    {
      title: 'Campus Placement Drive - TCS & Infosys',
      content: 'We are pleased to announce that TCS and Infosys will be conducting recruitment drives on campus from March 20-22, 2027.\n\nEligibility:\n- B.Tech CSE, IT, ECE (2027 batch)\n- Minimum 7.0 CGPA\n- No active backlogs\n\nInterested students must register through the placement portal by March 15, 2027.',
      category: 'placement',
      target_criteria: { global: true },
    },
    {
      title: 'Annual Tech Fest COGNIZANCE 2027 - Registration Open',
      content: 'Registration is now open for COGNIZANCE 2027, the annual technical festival of MMMUT Gorakhpur. Exciting competitions in AI/ML, Hackathons, Robotics, and Coding Challenges.\n\nDates: April 10-12, 2027\nEarly bird discount: 20% off until March 25\n\nAll students are encouraged to participate!',
      category: 'event',
      target_criteria: { global: true },
    },
    {
      title: 'Library Book Return Notice - Deadline Extended',
      content: 'The last date for returning library books has been extended to March 30, 2027. Students who fail to return books by the deadline will be charged a fine of Rs 10 per day per book.\n\nLibrary Hours: 9 AM - 8 PM (Mon-Sat)\nContact: library@mmmut.ac.in',
      category: 'academic',
      target_criteria: { global: true },
    },
    {
      title: 'Workshop on Machine Learning with Python',
      content: 'The CSE Department is organizing a 3-day workshop on Machine Learning with Python, covering supervised and unsupervised learning, neural networks, and practical hands-on projects.\n\nDate: March 25-27, 2027\nVenue: CSE Lab 3\nRegistration Fee: Rs 200\n\nLimited seats available. Register at the departmental office.',
      category: 'academic',
      target_criteria: { branch: 'CSE' },
    },
  ];

  for (const notice of notices) {
    const { data } = await axios.post(`${API}/notices/manual`, notice, { headers });
    console.log('Created:', data.notice.title);
  }

  console.log('\nDone! Created', notices.length, 'sample notices.');
}

seed().catch(err => {
  console.error('Seed error:', err.response?.data || err.message);
});
