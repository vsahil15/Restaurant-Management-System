import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import orderRouter from './routes/order.routes.js';
import bookRouter from './routes/book.routes.js';
import inventoryRouter from './routes/inventory.routes.js';
import authRouter from './routes/auth.routes.js';
import menuRouter from './routes/menu.routes.js';
import adminRouter from './routes/admin.routes.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',  // Your React frontend URL (cannot be '*' when using credentials)
  credentials: true,                // Allow cookies to be sent/received cross-origin
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  console.log("web api's are running");
  res.send("API is running");
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/menu', menuRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/booktable', bookRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/admin/inventory', inventoryRouter);

export default app; 