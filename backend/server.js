import app from './app.js';
import { connectDb } from './config/db.js';
import config from './config/config.js';

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

await connectDb();
