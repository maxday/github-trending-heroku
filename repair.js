'use strict';
const mongoClient = require('mongodb').MongoClient;
const utils = require("./utils");

const repairDatabase = () => new Promise((resolve, reject) => {
    let currentConnection = null;
    mongoClient.connect(utils.mongoConnectionUrl)
    .then(conn => { currentConnection = conn; return conn.command({repairDatabase:1})})
    .then(out => resolve({currentConnection, out}))
    .catch(err => reject({currentConnection, err}));
});

repairDatabase()
.then(res => {
    console.log("success : ", res.out);
    utils.closeConnection(res.currentConnection);
})
.catch(err => {
    console.log("failure : ", err.err);
    utils.closeConnection(err.currentConnection);
});