const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017/";
const dbName = "flux_web3";

const fetchRevenue = async (callback) => {
  const client = new MongoClient(uri, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
  const db = await client.connect();
  const dbo = client.db(dbName);
  const query = {};
  dbo.collection('revenue').find(query).toArray(function(err, result) {
    db.close();
    if (err) throw err;
    callback(result);
  });
};

const storeRevenue = async (revenueData) => {
  const client = new MongoClient(uri, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
  const db = await client.connect();
  const dbo = client.db(dbName);
  const query = { timestamp: revenueData.timestamp };
  const newValues = { $set: revenueData };
  dbo.collection('revenue').updateOne(query, newValues, { upsert: true }, function(err, res) {
    db.close();
    if (err) throw err;
  });
};

module.exports = {
  fetchRevenue,
  storeRevenue,
};