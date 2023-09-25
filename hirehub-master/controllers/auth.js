const auth          = require("../controllers/auth"),
      express       = require('express'),
      passport      = require('passport'),
      router        = express.Router(),
      session       = require('express-session');

var User = require('../models/user');


const registerGet = (req, res, next) => {
    res.render("register");
}


const registerPost = (req, res, next) => {
    const saltHash = genPassword(req.body.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;
    const newUser = new User({
        username: req.body.email,
        name: req.body.name,
        branch: req.body.branch,
        cgpa: req.body.cgpa,
        hash: hash,
        salt: salt,
        mobile_number: 1,
        personal_email: null,
        resume_link: null,
        documents_link: null
    })
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
        }
        res.redirect("/home");
    })
    newUser.save().then((user) => {
        console.log(user);
    }).catch((err) => {
        console.log(err);
    })
    req.flash("success", "Account Created!!");
    res.redirect("/home");
}

module.exports = {  registerGet, registerPost };