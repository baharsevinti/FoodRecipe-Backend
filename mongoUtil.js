const { MongoClient } = require("mongodb");
require("dotenv").config(); 
const mongoose = require('mongoose');
var _db;


module.exports = {
  connectToServer: async function( callback ) {

      mongoose.connect(process.env.DB_URL, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
      })
      .then(() => console.log('MongoDB ile bağlantı kuruldu.'))
      .catch(err => console.error('MongoDB bağlantısı başarısız:', err));



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