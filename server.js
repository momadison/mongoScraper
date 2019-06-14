var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/articleDB"
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.nytimes.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    db.Article.remove({saved: false}).then((data)=> {
      console.log("DATA INFO: ", data);
    });
    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {
      // Save an empty result object
      var results = {};

      // Add the text and href of every link, and save them as properties of the result object
      results.title = $(element)
      .find('span')
      .text()
       || $(element)
      .find('h2')
      .text();
      results.link = $(element)
      .find('a')
      .attr("href");
      results.description = $(element)
      .find('ul')
      .text() 
      || $(element)
      .find('p')
      .text();

      // Create a new Article using the `result` object built from scraping
      db.Article.create(results)
        .then(function(dbArticle) {
          // View the added result in the console
          // console.log("ADDED TO DB: ",dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

app.get("/savedArticles", (req, res) => {
  db.Article.find({saved: true}).then((savedArticles) => {
    res.json(savedArticles);
  });
})

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for getting all Articles from the db
app.get("/savedArticles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({saved: true})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.find({ _id: req.params.id })
    
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


app.put("/articles/:id/:bool", (req, res) => {
  db.Article.findByIdAndUpdate(
    {_id: req.params.id}, {$set: {saved: req.params.bool}}, (err, todo) => {
    if (err) return res.status(500).send(err);
    return res.send(todo);
  })
})



// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
