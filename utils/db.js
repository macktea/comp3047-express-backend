const { MongoClient, ObjectId } = require('mongodb');

process.env.MONGODB_URI = 'mongodb://comp3047mak:kwXK5sclx4PcQ92Us4RyTvXWzl93FCOu72U1OfJnNOpXkRdj2V95aFUI0oNXN9T6OCfugdhR3aRlACDbqZrsjg==@comp3047mak.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@comp3047mak@';

if (!process.env.MONGODB_URI) {
    // throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
}

// Connect to MongoDB
async function connectToDB() {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('rent_equipment');
    db.client = client;
    return db;
}

module.exports = { connectToDB, ObjectId };