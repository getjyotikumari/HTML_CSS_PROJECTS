const express = require('express');


module.exports.isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("error", "You need to be logged in to do that!!")
        res.redirect("/")
    }
}


module.exports.isAdmin = (req, res, next) => {
    if(req.isAuthenticated()){
        if(req.user.admin){
            next();
        } else {
            req.flash("error", "You don't have permission to do that!!")
            res.redirect("back");
        }
    } 
    else {
        req.flash("error", "You need to be logged in to do that!!")
        res.redirect("/")
    }
}