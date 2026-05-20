import gameRoutes from './routes/games.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import leaderboardRoutes from './routes/leaderboard.js'; // 👈 added
import adminRoutes from './routes/admin.js';

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes); // 👈 added
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Zeal Arcade API is running', status: 'healthy' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});