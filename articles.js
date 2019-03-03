var mongoose = require("mongoose");
// var commentSchema = require("./comment.js")

var Schema = mongoose.Schema;

// var commentSchema = new Schema({
//     comment: String
// });

var ArticleSchema = new Schema({
    title: String,
    link: String,
    summary: String,
    commentsArray: [{
        type: Schema.Types.ObjectId,
        ref: "comments"
    }]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;