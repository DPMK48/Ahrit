import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import sessionRoutes from './routes/sessionRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import adaptationRoutes from './routes/adaptationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/adaptations', adaptationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'adaptive-hci-server',
  });
});

// Start Server after connecting to Database
async function bootstrap() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`Adaptive HCI Server running on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}/api`);
      console.log(`Health:  http://localhost:${PORT}/api/health`);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

export default app;
