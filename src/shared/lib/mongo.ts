import 'server-only';

import { MongoClient, type Collection, type Db, type Document, type MongoClientOptions } from 'mongodb';

import { MONGO_MAX_RETRIES, MONGO_RETRY_DELAY_MS, MONGO_SERVER_SELECTION_TIMEOUT_MS } from '@/shared/constants/mongo';
import { env } from '@/shared/lib/env';
import { globalSingleton } from '@/shared/utils/global-singleton';

class MongoClientManager {
  private clientPromise: Promise<MongoClient> | null = null;

  async getDb(): Promise<Db> {
    const client = await this.getClient();
    return client.db(env.get().MONGO_DB_NAME);
  }

  async getCollection<T extends Document = Document>(collectionName: string): Promise<Collection<T>> {
    const database = await this.getDb();
    return database.collection<T>(collectionName);
  }

  async ping(): Promise<void> {
    const database = await this.getDb();
    await database.command({ ping: 1 });
  }

  async closeConnection(): Promise<void> {
    if (!this.clientPromise) return;
    const client = await this.clientPromise;
    this.clientPromise = null;
    await client.close();
  }

  // Concurrent callers share one in-flight connection instead of racing to open several.
  private getClient(): Promise<MongoClient> {
    this.clientPromise ??= this.connect(MONGO_MAX_RETRIES).catch((error: unknown) => {
      this.clientPromise = null;
      throw error;
    });
    return this.clientPromise;
  }

  private async connect(retriesLeft: number): Promise<MongoClient> {
    const { MONGO_URL, MONGO_USER, MONGO_PASSWORD } = env.get();
    const options: MongoClientOptions = {
      serverSelectionTimeoutMS: MONGO_SERVER_SELECTION_TIMEOUT_MS,
      ...(MONGO_USER && MONGO_PASSWORD ? { auth: { username: MONGO_USER, password: MONGO_PASSWORD } } : {}),
    };

    try {
      const client = new MongoClient(MONGO_URL, options);
      await client.connect();
      return client;
    } catch (error) {
      if (retriesLeft <= 0) throw error;
      console.warn(`MongoDB connection failed, retrying (${MONGO_MAX_RETRIES - retriesLeft + 1}/${MONGO_MAX_RETRIES})`, error);
      await new Promise((resolve) => setTimeout(resolve, MONGO_RETRY_DELAY_MS));
      return this.connect(retriesLeft - 1);
    }
  }
}

export const mongo = globalSingleton('mongo', () => new MongoClientManager());

export { MongoClientManager };
