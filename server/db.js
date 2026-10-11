import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export let isConnectedToMongo = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/adaptive_hci_learning';

  try {
    // Attempt standard connection to MongoDB
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    isConnectedToMongo = true;
    console.log(`[Database] Connected to MongoDB instance at ${uri}`);
  } catch (err) {
    console.warn(`[Database] Local/Remote MongoDB not reachable (${err.message}).`);
    console.log(`[Database] Running in embedded in-memory persistence mode.`);
    isConnectedToMongo = false;
  }
}

export async function disconnectDB() {
  if (isConnectedToMongo) {
    await mongoose.disconnect();
    isConnectedToMongo = false;
  }
}
