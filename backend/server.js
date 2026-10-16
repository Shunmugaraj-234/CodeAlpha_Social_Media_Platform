const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const seedDatabase = require('./utils/seedData');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/communities', require('./routes/communityRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Fallback route for frontend HTML pages
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const file = req.path === '/' ? 'index.html' : req.path.endsWith('.html') ? req.path : `${req.path}.html`;
  res.sendFile(path.join(__dirname, '../frontend', file), err => {
    if (err) {
      res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const listenOnPort = (startPort) => {
  const server = app.listen(startPort, () => {
    console.log(`=================================================`);
    console.log(`🚀 PULSE Social Community Platform Backend Ready!`);
    console.log(`🌐 Server running at: http://localhost:${startPort}`);
    console.log(`=================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Server] Port ${startPort} is in use, trying port ${startPort + 1}...`);
      listenOnPort(startPort + 1);
    } else {
      console.error('[Server Error]', err);
    }
  });
};

const startServer = async () => {
  await connectDB();

  // Auto seed database if empty
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('[Server] Database is empty. Running initial seed data setup...');
    await seedDatabase();
  }

  const initialPort = parseInt(process.env.PORT) || 5000;
  listenOnPort(initialPort);
};

startServer();

