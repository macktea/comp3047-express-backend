require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const { MongoClient, ObjectId } = require('mongodb');

if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable.');
}

async function connectToDB() {
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = client.db('rent_equipment');
    db.client = client;
    return db;
}

module.exports = { connectToDB, ObjectId };