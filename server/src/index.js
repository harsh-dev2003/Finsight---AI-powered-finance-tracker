const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const uploadRoutes = require('./routes/upload');
const budgetRoutes = require('./routes/budgets');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');

// Import jobs
const startMonthlyReportJob = require('./jobs/monthlyReport');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start cron jobs
startMonthlyReportJob();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
