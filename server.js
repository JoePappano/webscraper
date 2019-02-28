var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose")

var Comment = require("./comment.js")
var Articles = require("./articles.js")

var app = express();


mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true });

var databaseUrl = "scraper";
var collections = ["scrapedData", 'comments'];

var db = mongojs(databaseUrl, collections);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public/js/'));

app.engine(
    "handlebars",
    exphbs({
      defaultLayout: "main"
    })
  );
app.set("view engine", "handlebars");

db.on("error", function(error) {
    console.log("Database Error:", error);
})

app.get("/", function(req, res) {
    db.scrapedData.find({}, function(err, data) {
        if (err) throw err;
        res.render("index", {scrapedData:data});
    });
});

app.post("/submit", function(req, res) {
    console.log('submit', req.body.comment)
    Comment.create({ comment: req.body.comment })
    .then(function(dbComment){
        console.log("it works!" + req.body.comment)
        db.comment.findOneAndUpdate({}, {$push: {comments: dbComment._id} }, {new: true});
    }).then(function(dbScrapedData){
        res.json(dbComment);
    }).catch(function(err) {
        // console.log('Something broke', err);
        res.json(err);
    });
});

app.get("/clear", function(req, res) {
    db.scrapedData.remove({}, function(err, data) {
        if (err) throw err;
        res.redirect("/");
    });
});

app.get("/scrape", function(req, res) {

    axios.get("http://www.nytimes.com").then(function(response){
    var $ = cheerio.load(response.data);
    var results = [];

    $("article").each(function(i, element) {
        var title = $(element).find("h2").text();
        var link = $(element).find("a").attr("href");
        var summary = $(element).children().text()

        Articles.create({
        title,
        link,
        summary
        }).then(function(data) {
            console.log(data);
        })
        // .then(function(dbArticle){
            // console.log("it works!" + req.body.comment)
            // db.articles.findOneAndUpdate({}, {$push: {articles: dbArticle._id} }, {new: true});

        // }).then(function(dbScrapedData){
        //     res.json(dbArticle);
        // }).catch(function(err) {
        //     // console.log('Something broke', err);
        //     res.json(err);
        // });
    })
    res.redirect("/")
    });
    
});

app.listen(3000, function() {
    console.log("App running on port 3000!")
})