require("dotenv").config();
const express = require("express");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const mongoose = require("mongoose");

// Scraping Tools
const cheerio = require("cheerio");
const axios = require("axios")

// Require all models
var db = require("./models");

//Initialize express
const app = express();
var PORT = process.env.PORT || 3030;

// Middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/articleDB", { useNewUrlParser: true});

// Routes
//Scrape data and put it into the mongoDB
app.get("/scrape", function(req, res) {

  axios.get("https://www.nytimes.com").then(function(response) {
  //Load the response into cheerio and save it to the '$' variable
  const $ = cheerio.load(response.data);
  
  //Use Cheerio to get data
  $("article").each((i, element) => {

    //Create an empty array to save our data 
    const results = [];

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

    if (results.title && results.link && results.description) {
      db.Article.create(results)
        .then((created) => {
          console.log(results);
          console.log(created);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    });
    res.send("Scrape Complete");
})
});

app.get("/articles", (req, res) => {
  db.Article.find({})
    .then((articles) => {
      res.json(articles);
    })
    .catch((err) => {
      res.json(err);
    })
})

var syncOptions = { force: false };
// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}
// Starting the server, syncing our models ------------------------------------/
// db.sequelize.sync(syncOptions).then(function() {
  app.listen(PORT, function() {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });


module.exports = app;
