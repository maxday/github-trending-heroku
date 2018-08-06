const getMongoConnectionUrl = (user, pass, host, dbName) =>
    "mongodb://" + user + ":"+ pass + "@"+ host + "/" + dbName;

const closeConnection = (connection) => {
    if(connection) {
        return connection.close();
    }
};

const mongoConnectionUrl = getMongoConnectionUrl(
    process.env.MONGODB_USER, 
    process.env.MONGODB_PASS,
    process.env.MONGODB_HOST, 
    process.env.MONGODB_DB
);

exports.mongoConnectionUrl  = mongoConnectionUrl;
exports.collectionName = process.env.MONGODB_COLLECTION || 'tmp_data';
exports.closeConnection = closeConnection;


