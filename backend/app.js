import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import orderRouter from './routes/order.routes.js';
import bookRouter from './routes/book.routes.js';
import inventoryRouter from './routes/inventory.routes.js';
import authRouter from './routes/auth.routes.js';
import menuRouter from './routes/menu.routes.js';
import adminRouter from './routes/admin.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, or same-origin requests)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow origin in development / production flexibility
  },
  credentials: true, // Allow cookies to be sent/received cross-origin
}));

app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/menu', menuRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/booktable', bookRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/admin/inventory', inventoryRouter);

// Serve static frontend files from build directory
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback: return index.html for non-API requests
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      res.status(404).send("Frontend build not found. Please run 'npm run build' inside frontend.");
    }
  });
});

export default app; 