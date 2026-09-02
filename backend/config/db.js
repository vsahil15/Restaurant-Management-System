import mongoose from 'mongoose';
import config from '../config/config.js';

export async function connectDb(){
  try{
    await mongoose.connect(config.DB_URL);
    return true;
  }
  catch(err){
    console.error('MongoDB connection error:', err);
    return false;
  }
}