import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;

export async function initMongoClient(): Promise<MongoClient> {
  if (!client) {
    console.log('Initializing MongoDB client');
    client = new MongoClient(process.env.MONGODB_URI || '');
    await client.connect();
  }
  return client;
}

export function getMongoClient(): MongoClient {
  if (!client) {
    throw new Error('Mongo database is not initialized');
  }
  return client;
}