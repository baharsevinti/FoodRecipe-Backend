const { MongoClient } = require("mongodb");
require("dotenv").config(); 

var _db;


module.exports = {
  connectToServer: async function( callback ) {
    const client = await MongoClient.connect(process.env.DB_URL, {useNewUrlParser:true, useUnifiedTopology:true,
     
      serverSelectionTimeoutMS: 30000});

    try {
      _db  = client.db('Foods');
      return callback();
    } catch (e) {
      throw e;
    } 
  },

  getDb: function() {
    return _db;
  }
};