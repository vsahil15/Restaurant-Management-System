import express from 'express';
import orderRouter from './routes/order.routes.js';
import bookRouter from './routes/book.routes.js';
import inventoryRouter from './routes/inventory.routes.js';

const app = express();

app.use(express.json());

app.get('/',(req,res)=>{
    console.log("web api's are running");
    res.send("API is running");
});

app.use('/api/v1/order',orderRouter);
app.use('/api/v1/booktable',bookRouter);
app.use('app/v1/admin/inventory',inventoryRouter)

export default app;