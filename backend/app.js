import express from 'express';
import orderRouter from './routes/order.routes.js';

const app = express();

app.use(express.json());

app.get('/',(req,res)=>{
    console.log("web api's are running");
    res.send("API is running");
});

app.use('/api/v1/order',orderRouter)

export default app;