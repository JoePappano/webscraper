var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose")
var PORT = process.env.PORT || 3000;

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

// Story.findOne({ title: 'Casino Royale' }).
//   populate('author').
//   exec(function (err, story) {
//     if (err) return handleError(err);
//     console.log('The author is %s', story.author.name);
//     // prints "The author is Ian Fleming"
//   });

// app.get("/", function(req, res) {
//     res.json(path.join(_dirname, "./index.html"))
// })


app.get("/", function(req, res) {
    Articles.find({}, function(err, data) {
        if (err) throw err;
        res.render("index", {articles:data});
    });
    // db.articles.find({}, function(err, data) {
    //     if (err) throw err;
    //     res.render("index", {articles:data});
    // });
});


app.get("/view", function(req, res) {
    Comment.find({}, function(err, data) {
        if (err) throw err;
        res.render("comments", {comments:data});
    });
    // db.articles.find({}, function(err, data) {
    //     if (err) throw err;
    //     res.render("index", {articles:data});
    // });
});


// app.get("/populated", function(req, res) {
//     // Using our Library model, "find" every library in our db and populate them with any associated books
//     db.Library.find({})
//       // Specify that we want to populate the retrieved libraries with any associated books
//       .populate("books")
//       .then(function(dbLibrary) {
//         // If any Libraries are found, send them to the client with any associated Books
//         res.json(dbLibrary);
//       })
//       .catch(function(err) {
//         // If an error occurs, send it back to the client
//         res.json(err);
//       });
//   });

app.get("/populated", function(req, res) {
    Articles.find({}).populate("comments").then(function(dbArticles) {
        res.json(dbArticles);
    })
    .catch(function(err) {
        res.json(err);
    })
})


app.post("/submit", function(req, res) {
    console.log('submit', req.body.comment)
    Comment.create({ 
        comment: req.body.comment,
     })
    .then(function(dbComment){
        console.log("it works!" + req.body.comment)
        res.redirect("/view")
        Articles.findOneAndUpdate({}, {$push: {commentsArray: comment} }, {new: true});
    }).then(function(dbScrapedData){
        res.redirect("/")
    }).catch(function(err) {
        // console.log('Something broke', err);
        res.json(err);
    });
});

app.get("/clear", function(req, res) {
    Articles.remove({}, function(err, data) {
        if (err) throw err;
        res.redirect("/");
    });
});

app.get("/clearComments", function(req, res) {
    console.log("wowsers!")
    Comment.remove({}, function(err, data) {
        if (err) throw err;
        res.redirect("/view");
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

app.listen(PORT, function() {
    console.log("App running on port 3000!")
})