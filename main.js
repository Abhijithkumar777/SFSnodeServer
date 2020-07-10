const express= require('express');
const app= express();
const vision = require('@google-cloud/vision');
const language =require('@google-cloud/language');
const _ = require('lodash');
//const { result } = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');
 

includeRegex = /(?:[\w/:@-]+\.[\w/:@.-]*)+(?=\s|$)/g ;
excludeRegex = /.*@.*/ ;
//const fileName = 'E:/css/card.jpg';


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: '100mb',extended: false }));
 
// parse application/json
app.use(bodyParser.json({limit: '100mb'}));

// Creates a client
const client = new vision.ImageAnnotatorClient({ 
    keyFilename: 'APIKey.json'
}
    
);
const languageClient = new language.LanguageServiceClient({
        keyFilename: 'APIKey.json'
});

/**
 * TODO(developer): Uncomment the following line before running the sample.
 */
 

 async function listBuckets(fileName) {
  

    try {
// Performs text detection on the local file
const [result] = await client.textDetection("./images/" + fileName);
const detections = result.textAnnotations[0].description;
//const detections = "Enfin\nGokul Vijay\nBusiness Development Manager\n +91 80860 95030 \n  mail : arunrajss@gmail.com ";
const languageResults = await languageClient.analyzeEntities({
    document: {
      content: detections,
      type: 'PLAIN_TEXT',
      
    },
  });


  // Go through detected entities
  //console.log(languageResults);
  const {entities} = languageResults[0];
//console.log('haii',entities);

var reult = entities
.filter(function(data) { return data.type == "PERSON"})
.map(function(x){return { [x.type] : x.name} });
  resltPhone=entities
  .filter(function(data) { return data.type == "PHONE_NUMBER"})
  .map(function(x){return { [x.type] : x.name} });
  reult[0]['PHONE_NUMBER']=resltPhone[0]? resltPhone[0]['PHONE_NUMBER']:null; 
  reult[0]['WEB'] =extractWeb(detections) ? extractWeb(detections)[0]:null;
  reult[0]['MAIL'] =extractEmails(detections) ? extractEmails(detections)[0]:null;
console.log('reslt',reult);
return reult;
//console.log('web :',extractWeb(detections));
//console.log('email :',extractEmails(detections));

//detections.forEach(text => console.log(text));
    }catch (err) {
        // Throw an error
        console.log(err);
      }

 }
 function extractEmails ( text ){
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
  }
  function extractWeb ( text ){ 
  return text.match(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);
    }

    const uploadImage = async (req, res, next) => {
      // to declare some path to store your converted image
      var matches = req.body.base64image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};
       
      if (matches.length !== 3) {
      return new Error('Invalid input string');
      }
       
      response.type = matches[1];
      response.data = Buffer.from(matches[2], 'base64');
      let decodedImg = response;
      let imageBuffer = decodedImg.data;
      let type = decodedImg.type;
      let extension = mime.getExtension(type);
      let fileName = "image." + extension;
      try{
      writeImage(fileName,imageBuffer).then(()=>{
       listBuckets(fileName)
        return  listBuckets(fileName);
      }).then((r)=>{
        return res.send(r);
      });
    }catch(e){
      next(e);
    }
      }
       
      async function writeImage(fileName,imageBuffer){
          fs.writeFileSync("./images/" + fileName, imageBuffer, 'utf8')
          return 1;      
      }
	  
    
      app.post('/upload/image', uploadImage);
      app.get('/', function (req, res) {
        res.send('Hello World!');
      });

  
 //listBuckets();
app.listen(5000, ()=> console.log('Server running'));
