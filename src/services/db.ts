import * as mongoDB from "mongodb"
import * as dotenv from "dotenv"

export const collections: { favorites?: mongoDB.Collection } = {}

export async function connectToDatabase () {
  dotenv.config()
  const { MONGO_CONN_STRING, COLLECTION_NAME, MONGO_DB_NAME } = process.env
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(MONGO_CONN_STRING!)
  await client.connect()
  const db: mongoDB.Db = client.db(MONGO_DB_NAME!)

  const favoritesCollection: mongoDB.Collection = db.collection(COLLECTION_NAME!)

  collections.favorites = favoritesCollection
  console.log(`Successfully connected to database: ${db.databaseName} and collection: ${favoritesCollection.collectionName}`)
}