const mongoClient = require('mongodb').MongoClient;
const fetch = require("node-fetch");
const fs = require('fs');
const utils = require("./utils");

const DATA_FILENAME = 'data.json';

const GITHUB_URI_TOKEN = '?access_token=';
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

const getStarredRepo = (mongoConnectionUrl, collectionName, githubUriToken, githubApiToken) => new Promise((resolve, reject) => {
    let currentConnection = null;
    let groupQuery =  [
        { $group: { _id: { repo : "$repo", type: "$type" }, count: { $sum: 1 } } }, 
        { $sort: { "count": -1 } }, 
        { $match: { count: { '$gte': 3 }, '_id.type' : 'WatchEvent' } }
    ];  
    mongoClient.connect(mongoConnectionUrl)
    .then(conn => { currentConnection = conn; return conn.collection(collectionName); })
    .then(conn => conn.aggregate(groupQuery).toArray())
    .then(out => resolve({currentConnection, out, githubUriToken, githubApiToken}))
    .catch(err => reject({currentConnection, err}));
});

const recordsToPromiseArray = (records, githubUriToken, githubApiToken) => {
    let promiseArray = [];
    records.map(repo => {
        promiseArray.push(
            fetch(repo._id.repo.url + githubUriToken + githubApiToken)
            .then(res => res.json())
            .catch(err => console.log("cant fetch"))
        );
    });
    return promiseArray;
}

const promiseArrayToResult = (promiseArray) => {
    let finalMap = { data : {}, extraData : {}};
    return Promise.all(promiseArray).then(function(values){
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
    });
}

const writeFilePromise = (fileName, data) => new Promise((resolve, reject) => {
    fs.writeFile(fileName, data, function(err) {
        if (err) {
            reject(err)
        }
        else {
            resolve(data)
        }
    });
});

getStarredRepo(utils.mongoConnectionUrl, utils.collectionName, GITHUB_URI_TOKEN, GITHUB_API_TOKEN)
.then(res => {
    const promiseArray = recordsToPromiseArray(res.out, res.githubUriToken, res.githubApiToken);
    utils.closeConnection(res.currentConnection);
    return promiseArrayToResult(promiseArray);
})
.then(res => writeFilePromise(DATA_FILENAME, JSON.stringify(res)))
.catch(err => {
    console.log("failure : ", err);
    utils.closeConnection(err.currentConnection);
});