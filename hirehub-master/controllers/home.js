const express = require('express');
var Job = require('../models/job');

function resolveAfter2Seconds(x) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(x);
		}, 10000);
	});
}

async function f1() {
	var x = await resolveAfter2Seconds(10);
	console.log(x); 
}

const homeGet = async (req, res, next) => {
		f1();
		Job.find({ status: 'Active' }).sort({ _id: -1 }).limit(5).exec(function(err, jobs) {
			if (err) {
				console.log(err);
				req.flash('error', 'Something went wrong, Please try again later');
				res.redirect('/');
			} else {
				res.render('home', { recentJobs: jobs });
			}
		});
};

module.exports = { homeGet };
