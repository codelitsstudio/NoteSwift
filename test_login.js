const { exec } = require('child_process');

const command = `curl -X POST "http://localhost:5000/api/teacher/auth/login" -H "Content-Type: application/json" -d '{"email": "testteacher@example.com", "password": "password123"}'`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  console.log(`Output: ${stdout}`);
});