const MongoClient = require('mongodb').MongoClient;

const MONGO_DB = process.env.MONGO_DB
const MONGO_COLLECTION = process.env.MONGO_COLLECTION
const MONGO_STRING = process.env.MONGO_STRING;

const remove = async (connectUrl, dbName, collectionName) => {
    const client = await MongoClient
        .connect(connectUrl, { useNewUrlParser: true, useUnifiedTopology: true })
        .catch(err => { console.log(err); });
        if (!client) {
            return;
        }
        try {
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            await collection.drop();
        } catch (err) {
            console.log(err);
        } finally {
            client.close();
        }
}

(async () => {
    await remove(MONGO_STRING, MONGO_DB, MONGO_COLLECTION);
})().catch(err => {
    console.error(err);
});