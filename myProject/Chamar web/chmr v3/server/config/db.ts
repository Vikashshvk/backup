import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Database] MONGODB_URI not provided. Running with resilient community store.');
    return false;
  }

  if (isConnected) {
    return true;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = !!conn.connections[0].readyState;
    console.log(`[Database] MongoDB connected via Mongoose: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn('[Database] Mongoose could not connect to provided MONGODB_URI. Operating with fallback storage.', error);
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
