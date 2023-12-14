//bunlar kütühaneleri kullanmak için gerekli değişken tanımlaması
const OpenAIApi  = require("openai"); 
const express = require("express");
require("dotenv").config(); 
const app = express();
const bodyParser = require('body-parser');
var mongoUtil = require("./mongoUtil");
const authRoutes = require('./routes/auth');
const { MongoClient } = require('mongodb');

//open ai auth
const openai = new OpenAIApi({apiKey: process.env.OPENAI_SECRET_KEY}); 
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,          
   optionSuccessStatus:200,
}
app.use(cors(corsOptions));



app.get('/api/liste', (req, res) => {

  mongoUtil.connectToServer( async function( err, client ) {
    if (err) console.log(err);
    var db = mongoUtil.getDb();
    const foods = db.collection('food');
    const food = await foods.findOne({});
      res.send(food);
  } );
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

    console.log(postData);

var prompt = `Write a recipe suggestion using the seven steps listed below for the meal ingredient list below. The seven steps are:
Introduction make it even longer
Ingredients (write clearly)
Directions (write detailed)
How to prepare (write detailed)
Preparation time (write detailed)
Nutrition Facts (per serving)(write detailed)
storage conditions (write detailed)
FAQs (research and write at least 5 questions and answers)
Conclusion (write 200 words long)
Sentence length should be short with enough transition words. Write it in Turkish* ${postData}.
Include a title as a H1, an intro, then sections as H2s. break up the article into sections and format the headers as h2 headers and the title as h1 in markdown formatting.`;
    
console.log(prompt);
    //chat gpt baglantısı ve cevabı
    const GPTOutput = await openai.chat.completions.create({ 
		model: "gpt-3.5-turbo", 
        messages: [{ role: "user", content: prompt}]
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
