const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS for all origins (for development)
app.use(cors({
  origin: true,
  credentials: true
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/ping', (req, res) => {
  res.json({ success: true, message: 'File server is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'File not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple File Server Started!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`📁 Serving uploads from: ${path.join(__dirname, 'uploads')}`);
  console.log(`💚 Health: http://localhost:${PORT}/ping\n`);
});