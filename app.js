const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/postsDB");

const postSchema = new mongoose.Schema({
    title: String,
    content: String
});
const contactSchema = new mongoose.Schema({
    userName: String,
    userEmail: String,
    userMessage: String
});

const Contact = mongoose.model("Contact", contactSchema);
const Post = mongoose.model("Post", postSchema);

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


app.get("/",function (req, res) {
    Post.find({}, function (err, posts) {
        if (!err){
            res.render("blog", {postList : posts});
        };
    });
});

app.post("/add",function (req, res) {
    const titleName = _.startCase(_.toLower(req.body.postTitle));
    const details = req.body.postContent;
    Post.findOne({title: titleName}, function (err, found) {
        if (found){
            Post.findByIdAndUpdate(found._id, {content: details}, function (err) {
                if (!err){
                    console.log("Successfully updated")
                };
            });
        }else{
            if (titleName !== "" && details !== ""){
                const newPost = new Post({
                    title: titleName,
                    content: details 
                });
                newPost.save();
                res.redirect("/");
            }else{
                res.redirect("/add");
            };
        };
    });    
});

app.get("/posts/:postNumber", function (req, res) {
    const postId = req.params.postNumber;
    Post.findById(postId, function (err, foundPost) {
        if (!err){
            res.render("post", {postPage: foundPost});
        };
    });
    // posts.find(function (postName) {
    //     if (_.lowerCase(req.params.postNumber) === _.lowerCase(postName.title)) {
    //         res.render("post", {postPage : postName});
    //     }
    //     console.log(_.lowerCase(req.params.postNumber));
    // })
    
});

app.get("/contact", function (req, res) {
    res.render("contact");
});
app.post("/contact", function (req, res) {
    const name = _.startCase(_.toLower(req.body.userName));
    const email = req.body.userEmail;
    const message = req.body.userMessage;
    Contact.findOne({userEmail: email}, function (err, found) {
        if (found){
            res.redirect("/contact");
        }else{
            if (name !== "" && email !==""){
                const newContact = new Contact({
                    userName: name,
                    userEmail: email,
                    userMessage: message
                });
                newContact.save();
                res.redirect("/");
            }else{
                res.redirect("/contact");
            };
        };
    });
    
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.post("/delete", function (req, res) {
    const deletePostId = req.body.delete;
    Post.findByIdAndDelete(deletePostId, function(err){
        if (!err){
            console.log("Deleted successfully.");
        };
    });
    res.redirect("/");
});
app.get("/add", function(req, res){
    res.render("compose");
});


app.listen(3000, function () {
    console.log("Server is Running...");
});
