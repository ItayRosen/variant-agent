import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;

export function initMongoClient(): MongoClient {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI || '');
  }
  return client;
}

export function getMongoClient(): MongoClient {
  if (!client) {
    throw new Error('Mongo database is not initialized');
  }
  return client;
}