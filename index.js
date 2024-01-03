//bunlar kütühaneleri kullanmak için gerekli değişken tanımlaması
const OpenAIApi = require("openai");
const express = require("express");
require("dotenv").config();
const app = express();
const bodyParser = require('body-parser');
var mongoUtil = require("./mongoUtil");
const authRoutes = require('./routes/auth');
const { MongoClient } = require('mongodb');

//open ai auth
const openai = new OpenAIApi({ apiKey: process.env.OPENAI_SECRET_KEY });
const cors = require("cors");
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions));



app.get('/api/liste', (req, res) => {
  mongoUtil.connectToServer('Foods',async function (err, client) {
    if (err) console.log(err);
    var db = mongoUtil.getDb();
    const foods = db.collection('food');
    const food = await foods.findOne({});
    res.send(food);
  });
});


app.get('/api/hazirtarifal', (req, res) => {

  mongoUtil.connectToServer('Foods',async function (err, client) {
    if (err) console.log(err);
    var db = mongoUtil.getDb();
    const foods = db.collection('recipe');
    const food = await foods.findOne({});
    res.send(food);
  });
});
 //Kullanıcı listeleme
app.get('/api/user/list', (req, res) => {

  mongoUtil.connectToServer('test',async function (err, client) {
    if (err) console.log(err);
    var db = mongoUtil.getDb();
    const users = db.collection('users');
    const userList = await users.find({}).toArray();
    res.send(userList);
  });
});



// Admin panelinden Tarif silme

app.delete('/api/silTarif/:id', async (req, res) => {
  const tarifId = parseInt(req.params.id); // id değerini integer'a çevir

  try {
    const db = mongoUtil.getDb();
    const recipes = db.collection('recipe');

    // Belirtilen ID'ye sahip tarifi sil
    const result = await recipes.updateOne(
      {}, 
      { $pull: { tarifler: { id: tarifId } } }
    );

    // Silme işlemi başarılı mı kontrol et
    if (result.modifiedCount === 0) {
      return res.status(404).send("Tarif bulunamadı veya zaten silinmiş.");
    }

    res.status(200).send("Tarif başarıyla silindi.");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});


//basit bir gett isteği oluşturduk
app.get('/api', (req, res) => {
  res.send('status: OK');
});

//post isteğinden gelen body kısmını parst et dedik
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);

//post isteği tanımladık: kullanıcı buraya istek atarak tarif alabilsin diye
app.post('/api/yemektarifial', async (req, res) => {
  const postData = req.body["liste"];

  // Seçilen Malzemeler
  console.log(postData);


  // prompt değiştir daha basit hali kısalt madde madde verdir tarifi
var prompt = `Aşağıdaki yemek malzemesi listesi için aşağıda listelenen adımları kullanarak bir tarif önerisi hazırlayın. Adımlar şunlardır:
Tarif, Nasıl Hazırlanır: ifadesi ile başlamaldır
Yemek tarifi (ayrıntılı yazın)
Nasıl hazırlanır (ayrıntılı yazın)
Hazırlık süresi (ayrıntılı yazın)
Cümle uzunluğu yeterli sayıda geçiş sözcüğü içerecek şekilde kısa olmalıdır. Türkçe yazın* ${postData}.`




  console.log(prompt);
  //chat gpt baglantısı ve cevabı
  const GPTOutput = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }]
  });

  //chat gpt mesajı
  const output_text = GPTOutput.choices[0].message.content;
  res.send({
    "tarif": output_text,
  });

});


app.listen(process.env.PORT, () => {
  console.log("Server Listening on PORT:", process.env.PORT);
});
