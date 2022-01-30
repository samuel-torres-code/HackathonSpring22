// npm i express morgan lokijs ejs --save

// Import libraries
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const multer = require('multer')
const fs = require('fs')
const path = require('path')


// Configure Database, Clears database each time server restarts
const loki = require('lokijs');
var db = new loki('example.db');
var jokes = db.addCollection('jokes');
var posts = db.addCollection('posts');


//MongoDB
// const MongoClient = require('mongodb').MongoClient
// const myurl = 'mongodb://localhost:27017';

// MongoClient.connect(myurl, (err, client) => {
//   if (err) return console.log(err)
//   db = client.db('test') 
//   app.listen(3000, () => {
//     console.log('listening on 3000')
//   })
// })

// Configure Express Application
var app = express() 

// Where to store frontend assets
app.use(express.static('public'));

// Logging (Optional)
app.use(morgan('dev'));

// Allow for req.body to be utilized in '/upvote-joke'
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        console.log(file);
      cb(null, Date.now() + path.extname(file.originalname))
    }
  })
  
  var upload = multer({ storage: storage })

// Use the ejs templating engine in the views folder
app.set('view engine', 'ejs');



app.post('/upvote-joke', (req, res) => {
    // console.log(req.body)

    // [id, joke] Taken from upvote_joke() function in jokes HTML
    var id = req.body.id
    var joke = req.body.joke

    // See if joke exists in database ()
    var current_joke = jokes.findOne({ id });

    if(!current_joke) {
        // Joke not found. Add to database and give 1 upvote
        jokes.insert({joke, id, 'upvotes': 1});
    } else {
        // Joke found. Add 1 upvote
        current_joke.upvotes += 1

        // Save Joke 
        jokes.update(current_joke)
    }

    // Send 'ok' status back
    res.sendStatus(200)
})

//Home Page
app.get('/', (req, res) => {

    // Render home.ejs
    res.render('home')
})

app.get('/listings', (req, res) => {

    // Render listings.ejs
    res.render('listings')
})

app.get('/post', (req, res) => {

    
        res.render('post')
    
    // Render listings.ejs
})


//uploadphoto handler
app.post('/upload-photo', upload.single("image") ,(req, res) => {
    
    res.send('Image Uploaded')
  
})




// Leaderboard Page
app.get('/leaderboard', (req, res) => {

    // Render leaderboard
    // Pass in data
    // jokes.chain().find({}).simplesort('upvotes').data().reverse()
    // For jokes, chain functions: Find all, sort by upvotes, populate data in array, reverse order 
    res.render('leaderboard', {
        data: jokes.chain().find({}).simplesort('upvotes').data().reverse()
    })
})

// Start server on Port: 3000
app.listen(3000, () => {
    console.log("Server is running")
})