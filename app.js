// npm i express morgan lokijs ejs --save

// Import libraries
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const querystring = require('querystring')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid');
var fileId = 0
var currExt = ".jpg"





// Configure Database, Clears database each time server restarts
const loki = require('lokijs');
const { time } = require('console')
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants')
var db = new loki('example.db');
var jokes = db.addCollection('jokes');
var listings = db.addCollection('listings', { indices: ['id'] });
//var listings = db.addCollection('listings');





// Configure Express Application
var app = express() 

// Where to store frontend assets
app.use(express.static('public'));

app.use('/uploads', express.static('uploads'));

// Logging (Optional)
app.use(morgan('dev'));

// Allow for req.body to be utilized in '/upvote-joke'
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        console.log(file);
        currExt = path.extname(file.originalname);
      cb(null, fileId + currExt)
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


app.get('/random-listings', (req, res) => {
    //console.log(req.body.title)
    for(let i = 0; i< 99; i++) {

        
    var listing = listings.insert({
                    id: uuidv4(),
                    title: "fdsfdsfsdgfsd",
                    description: "dsafsdfswfsdfsdfsdfsdfdsfdsfds",
                    zip_code: 1213,
                    location: "ddsadasdasf",
                    imageName: fileId,
                    dateCreated: Date.now()
                    });
    listings.update(listing);
    
                }



    //var debugListing = console.debug(listings.findOne());

    

    // Send 'ok' status back
    res.sendStatus(200)
})


//post-listing
app.post('/post-listing', (req, res) => {
    //console.log(req.body.title)
    

    var listing = listings.insert({
                    id: uuidv4(),
                    title: req.body.title,
                    description: req.body.description,
                    zip_code: req.body.zip_code,
                    location: req.body.location,
                    imageName: fileId + currExt,
                    dateCreated: Date.now()
                    });
    listings.update(listing);
    fileId ++;



    //var debugListing = console.debug(listings.findOne());

    

    // Send 'ok' status back
    res.redirect('/listings');
})

//Home Page
app.get('/', (req, res) => {

    // Render home.ejs
    res.render('home')
})

var filterZip = 0
app.get('/listings', (req, res) => {

   if (filterZip == 0) {
    res.render('listings',{
        data: listings.chain().find({}).simplesort('dateAdded').data().reverse()
    })
   }
   else {
       console.log("filterZip ="+filterZip)
    res.render('listings',{
        data: listings.chain().find({}).where(function(obj) {
            return obj.zip_code === filterZip;
          }).simplesort('dateAdded').data().reverse()
    })
   }
    
    // Render listings.ejs
    
})

app.post('/listings', (req, res) => {
    if(req.params('zip_code')) {
        console.log(req.params('zip_code'))
        filterZip = req.params('zip_code')
    }
    else {
        filterZip = 0;
    }
   
    
    // Render listings.ejs
    res.redirect('/listings')
})


app.get('/post', (req, res) => {

    
        res.render('post')
    
    // Render listings.ejs
})


//uploadphoto handler
app.post('/upload-photo', upload.single("image") ,(req, res) => {
    
    console.log('image')
  
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
app.use( express.static( "img" ) );
var cors = require('cors');
const { red } = require('color-name')
const { fieldOffs } = require('tar')
app.use(cors());