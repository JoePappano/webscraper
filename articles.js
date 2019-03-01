var mongoose = require("mongoose");
// var CommentSchema = require("./comment.js")

var Schema = mongoose.Schema;

// var CommentSchema = new Schema({
//     comment: String
// });

var ArticleSchema = new Schema({
    title: String,
    link: String,
    summary: String,
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;