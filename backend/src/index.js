require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const authRouter = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const clientRouter = require('./routes/clientRoutes');
const visitRouter = require('./routes/visitRoutes');
const commandeRouter = require('./routes/commandeRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');
const prisma = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static uploads directory serving
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRouter);
app.use('/api/visits', visitRouter);
app.use('/api/commandes', commandeRouter);
app.use('/api/dashboard', dashboardRouter);

// Root endpoint for healthcheck
app.get('/health', async (req, res) => {
  try {
    // Quick query to test DB connection
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ success: true, message: 'Server is healthy and database is connected.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Database connection failed', details: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`[SalesTrack Backend] Server running on port ${PORT}`);
});
