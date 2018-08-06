'use strict';
const mongoClient = require('mongodb').MongoClient;
const utils = require("./utils");

const dropCollection = (collectionName) => new Promise((resolve, reject) => {
    let currentConnection = null;
    mongoClient.connect(utils.mongoConnectionUrl)
    .then(conn => { currentConnection = conn; return conn.collection(collectionName); })
    .then(conn => conn.drop())
    .then(out => resolve({currentConnection, out}))
    .catch(err => reject({currentConnection, err}));
});

dropCollection(utils.collectionName)
.then(res => {
    console.log("success : ", res.out);
    utils.closeConnection(res.currentConnection);
})
.catch(err => {
    console.log("failure : ", err.err);
    utils.closeConnection(err.currentConnection);
});