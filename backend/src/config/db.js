import mongoose from 'mongoose';

export default async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_lms';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB error:', error.message);
    process.exit(1);
  }
}
