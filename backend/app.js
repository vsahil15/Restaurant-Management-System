import express from 'express';
import orderRouter from './routes/order.routes.js';
import bookRouter from './routes/book.routes.js';
import inventoryRouter from './routes/inventory.routes.js';
import authRouter from './routes/auth.routes.js';
import menuRouter from './routes/menu.routes.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  console.log("web api's are running");
  res.send("API is running");
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/menu', menuRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/booktable', bookRouter);
app.use('/api/v1/admin/inventory', inventoryRouter);

export default app;