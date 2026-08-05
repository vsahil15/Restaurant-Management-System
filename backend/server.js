import app from './app.js';
import { connectDb } from './config/db.js';

app.listen(3000,()=>{
console.log("server is live");
});
await connectDb();
