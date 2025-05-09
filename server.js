// server.js - Express server setup
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Store data in memory (use a database in production)
const users = [
  { userId: '1', username: 'test', password: 'test123' }
];

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => 
    user.username === username && user.password === password
  );
  
  if (user) {
    // Return user info without password
    const { password, ...userInfo } = user;
    res.json(userInfo);
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// Register API
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  
  // Check if user already exists
  if (users.some(user => user.username === username)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Add new user
  const userId = Date.now().toString();
  users.push({ userId, username, password });
  
  // Return user info without password
  res.json({ userId, username });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
