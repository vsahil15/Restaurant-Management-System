import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path:path.join(__dirname,'../.env')});

const config = Object.freeze({
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL
});

export default config;