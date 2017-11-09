const express = require('express');
const port = 8080; 
const mongoose = require('mongoose'); 
const options = {
  useMongoClient: true, 
  server: { 
    socketOptions: { 
      keepAlive: 300000, 
      connectTimeoutMS: 30000 
    } 
  }, 
  replset: { 
    socketOptions: { 
      keepAlive: 300000, 
      connectTimeoutMS : 30000 
    } 
  } 
};
const urlmongo = "mongodb://u7rs6a1pnwqmkbs:ihvyP7tNM63lY5V6JIH7@b4pfr4tuuy0c6qe-"; 
mongoose.connect(urlmongo, options);
const db = mongoose.connection; 

db.on('error', console.error.bind(console, 'Connection Error')); 
db.once('open', function (){
    console.log("DB Connection OK"); 
});

const app = express(); 
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const Schema = mongoose.Schema({
    action: String, 
    value: String, 
    icon: String, 
    img: String,
    status: String   
}); 

const Button = mongoose.model('Button', Schema); 
const router = express.Router(); 

router.route('/')
.all(function(req,res){ 
      res.json({message : "Bienvenue sur API Serli Button", methode : req.method});
});
  
// get all buttons  
router.route('/api/buttons')
.get(function(req,res){ 
	Button.find(function(err, buttons){
        if (err){
            res.send(err); 
        }
        res.json(buttons);  
    }); 
})

// create new button
.post(function(req,res){
      var button = new Button();
      button.action = req.body.nom;
      button.value = req.body.adresse;
      button.icon = req.body.tel;
      button.img = req.body.description; 
      button.status = req.body.status; 
      button.save(function(err){
        if(err){
          res.send(err);
        }
        res.json({ message : 'INSERT OK' });
      }); 
});


// get button byId
router.route('/api/buttons/:buttonId')
.get(function(req,res){ 
  Button.findById(req.params.buttonId, function(err, button) {
    if (err)
        res.send(err);
    res.json(button);
  });
})

// update button byId
.put(function(req,res){ 
  Button.findById(req.params.buttonId, function(err, button) {
    if (err){
        res.send(err);
    }
    button.action = req.body.nom;
    button.value = req.body.adresse;
    button.icon = req.body.tel;
    button.img = req.body.description; 
    button.status = req.body.status;  
    button.save(function(err){
      if(err){
        res.send(err);
      }
      res.json({message : 'UPDATE OK'});
    });                
  });
})

// remove button byId
.delete(function(req,res){ 
  Button.remove({_id: req.params.buttonId}, function(err, button){
    if (err){
        res.send(err); 
    }
    res.json({message:"DELETE OK"}); 
  });     
});

app.use(router);

app.listen(port);