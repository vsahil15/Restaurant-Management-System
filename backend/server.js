import app from './app.js';
import { connectDb } from './config/db.js';
import config from './config/config.js';

const PORT = config.PORT || 3000;

const connected = await connectDb();

if (!connected) {
  console.warn('MongoDB connection unavailable; continuing to run health checks without database access.');
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


