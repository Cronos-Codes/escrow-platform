import { MongoClient } from "mongodb";

// For development, we'll use a mock MongoDB client to avoid connection issues
// In production, you should set up proper MongoDB environment variables
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Create a mock client for development
  const mockClient = {
    connect: () => Promise.resolve(),
    close: () => Promise.resolve(),
    db: () => ({
      collection: () => ({
        findOne: () => Promise.resolve(null),
        find: () => ({ toArray: () => Promise.resolve([]) }),
        insertOne: () => Promise.resolve({ insertedId: "mock-id" }),
        updateOne: () => Promise.resolve({ modifiedCount: 1 }),
        deleteOne: () => Promise.resolve({ deletedCount: 1 }),
      }),
    }),
  } as any;

  clientPromise = Promise.resolve(mockClient);
} else {
  // Production MongoDB setup
  const MONGODB_URL = process.env.MONGODB_URL;
  const DB_NAME = process.env.DB_NAME;
  
  if (!MONGODB_URL || !DB_NAME) {
    throw new Error('MongoDB configuration is required in production');
  }
  
  const uri = `${MONGODB_URL}/${DB_NAME}`;
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
