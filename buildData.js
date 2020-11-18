const MongoClient = require('mongodb').MongoClient;
const fetch = require("node-fetch");
const fs = require('fs');

const DATA_FILENAME = 'data.json';
const GITHUB_PATH_URI = '?access_token=';
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;
const MONGO_DB = process.env.MONGO_DB
const MONGO_COLLECTION = process.env.MONGO_COLLECTION
const MONGO_STRING = process.env.MONGO_STRING;

const getStarredRepo = async (connectUrl, dbName, collectionName) => {
    let arrayToReturn = [];
    const client = await MongoClient
    .connect(connectUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => { console.log(err); });
    if (!client) {
        return;
    }
    try {
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const groupQuery =  [
            { $group: { _id: { repo : "$repo", type: "$type" }, count: { $sum: 1 } } }, 
            { $sort: { "count": -1 } }, 
            { $match: { count: { '$gte': 3 }, '_id.type' : 'WatchEvent' } }
        ];  
        const res = await collection.aggregate(groupQuery);
        arrayToReturn = await res.toArray();
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
        return arrayToReturn;
    }
}

const recordsToPromiseArray = (records, githubPathUri, githubApiToken) => {
    let promiseArray = [];
    records.map(repo => {
        promiseArray.push(
            fetch(`${repo._id.repo.url}${githubPathUri}${githubApiToken}`)
            .then(res => res.json())
            .catch(err => console.log('fetch error'))
        );
    });
    return promiseArray;
}

const promiseArrayToResult = async (promiseArray) => {
    let finalMap = { data : {}, extraData : {}};
    const values = await Promise.all(promiseArray);
    values.map(singleValue => {
        const language = singleValue.language;
        if(finalMap.data[language]) {
            finalMap.data[language].push(singleValue.full_name);
        }
        else {
            finalMap.data[language] = [singleValue.full_name];
        }
    });
    finalMap.extraData.createdAt = new Date();
    return finalMap;
}

(async () => {
    const resultArray = await getStarredRepo(MONGO_STRING, MONGO_DB, MONGO_COLLECTION);
    const promiseArray = recordsToPromiseArray(resultArray, GITHUB_PATH_URI, GITHUB_API_TOKEN);
    const result = await promiseArrayToResult(promiseArray);
    await fs.writeFile(DATA_FILENAME, JSON.stringify(result), () => null);
})().catch(err => {
    console.error(err);
});
