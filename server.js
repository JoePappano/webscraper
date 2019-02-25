var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var hbrs = require("express-handlebars");

var app = express();

var databaseUrl = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);

// db.dropDatabase();

db.on("error", function(error) {
    console.log("Database Error:", error);
})

app.get("/", function(req, res) {
    res.send("Hi!")
});

app.get("/all", function(req, res){
    db.scrapedData.find({}, function(err, data) {
        if(err) {
            console.log(err);
        }
        else {
            res.json(data);
        }
    });
});


    // axios.get("https://nytimes.com".then(function(response){
    //     var $ = cheerio.load(response.data); 
    //     var results = [];

    //     $("article").each(function(i, element) {
    //         var title = $(element).children("span").text();
    //         var link = $(element).children("a").attr("href");
    //         var summary = $(element).children("li").text()

    //         if (title && link) {
    //             db.scrapedData.insert({
    //                 title: title,
    //                 link: link,
    //                 summary: summary
    //             },
    //             function(error, saved) {
    //                 if (error) {
    //                     console.log(error);
    //                 } else {
    //                     console.log(saved);
    //                 }
    //             }
    //             );
    //         }
    //     });
    // });
    // res.send("Scrape Complete")
    // )

axios.get("http://www.nytimes.com").then(function(response){
  var $ = cheerio.load(response.data);
  var results = [];

  $("article").each(function(i, element) {
    var title = $(element).children().text();
    var link = $(element).find("a").attr("href");
    var summary = $(element).children("li").text()

    db.scrapedData.insert({
      title: title,
      link: link,
      summary: summary
    })
  })
  console.log(results)
}),


app.listen(3000, function() {
    console.log("App running on port 3000!")
})