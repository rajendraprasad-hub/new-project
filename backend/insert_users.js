// Script to safely insert users with bcrypt hashes into PostgreSQL
const pool = require('./db');

const users = [
  {
    empId: '1001',
    name: 'Rajendra',
    password: '$2b$10$lBL3Bu4Xryv2NNvjb8rzjOfJ5vCcJcYnk3IswVIEvo4FSFETm3XT6',
    role: 'admin',
    team: 'MFPM',
    mustChangePassword: false
  },
  {
    empId: '1002',
    name: 'Arun',
    password: '$2b$10$RP0aM2unC7sCjO/KITz0bOWwzQJZ6RA7z7x4558Zlbll7Ec7USI5e',
    role: 'viewerAll',
    team: 'COE',
    mustChangePassword: false
  },
  {
    empId: '1003',
    name: 'Kumar',
    password: '$2b$10$iVoCreeDUuRLeoZGQnROveH8nfkQ9plW9NfZ0ldlaXGT0SVEimmN2',
    role: 'uploader',
    team: 'CMO',
    mustChangePassword: false
  },
  {
    empId: '1004',
    name: 'Manager',
    password: '1234',
    role: 'viewerAll',
    team: 'CIV',
    mustChangePassword: true
  },
  {
    empId: '12345',
    name: 'Test User',
    // bcrypt hash of 'test123'
    password: '$2b$10$YXOvzvK70s1Ys.nCdyeRUOjYxqg8kEkt6EHDaW6cMVniehSGSz3L6',
    role: 'viewerAll',
    team: 'TEST',
    mustChangePassword: false
  }
];

async function insertUsers() {
  for (const user of users) {
    await pool.query(
      `INSERT INTO users (emp_id, name, password, role, team, must_change_password) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (emp_id) DO UPDATE SET name = $2, password = $3, role = $4, team = $5, must_change_password = $6`,
      [user.empId, user.name, user.password, user.role, user.team, user.mustChangePassword]
    );
  }
  console.log('Users inserted/updated successfully.');
  process.exit(0);
}

insertUsers().catch(err => {
  console.error('Error inserting users:', err);
  process.exit(1);
});
