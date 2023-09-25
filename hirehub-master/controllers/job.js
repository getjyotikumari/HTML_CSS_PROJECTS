const Job = require('../models/job'),
	Notification = require('../models/notification'),
	User = require('../models/user');
const axios = require('axios').default;
const SERPAPI_KEY = process.env.SERPAPI_KEY;

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports.jobIndex = async (req, res) => {
	let noMatch = null;
	if (req.query.search) {
		const regex = new RegExp(req.query.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi');
		Job.find({ name: regex }, function(err, jobs) {
			if (err) {
				req.flash('error', 'Something went wrong in jobs database');
				console.log(err);
				res.redirect('/home');
			} else {
				if (jobs.length < 1) {
					noMatch = 'No jobs match that query, please try again.';
				}
				res.render('jobs/index', { jobs: jobs, noMatch: noMatch });
			}
		});
	} else {
		Job.find({}, function(err, jobs) {
			if (err) {
				req.flash('error', 'Something went wrong in jobs database');
				console.log(err);
				res.redirect('/home');
			} else {
				res.render('jobs/index', { jobs: jobs, noMatch: noMatch });
			}
		});
	}
};

module.exports.newJobForm = async (req, res) => {
	res.render('jobs/new');
};

module.exports.createNewJob = async (req, res) => {
	try {
		const newJob = await new Job(req.body.job);

		let notif = {
			description: `${req.body.job.name} just posted a new job !!`,
			author: req.body.job.name
		};
		const newNotif = await new Notification(notif);
		await newJob.save();
		await newNotif.save();
		req.flash('success', 'Successfully posted job');
		res.redirect(`/jobs/${newJob._id}`);
	} catch (err) {
		req.flash('error', 'Something went wrong in jobs database');
		console.log(err);
		res.redirect('/jobs/new');
	} 
};
 
module.exports.showJob = function(req, res) {
	Job.findById(req.params.id).populate('students').exec(function(err, foundJob) {
		if (err) {
			req.flash('error', 'Something went wrong in jobs database');
			console.log(err);
			res.redirect('/jobs');
		} else {
			res.render('jobs/show', { job: foundJob });
		}
	});
};

module.exports.editJobForm = function(req, res) {
	Job.findById(req.params.id, function(err, foundJob) {
		if (err) {
			req.flash('error', 'Something went wrong in jobs database');
			console.log(err);
			res.redirect('/jobs/' + req.params.id);
		} else {
			res.render('jobs/edit', { job: foundJob });
		}
	});
};

module.exports.updateJob = function(req, res) {
	Job.findByIdAndUpdate(req.params.id, req.body.job, function(err, updatedJob) {
		if (err) {
			req.flash('error', 'Something went wrong in jobs database');
			console.log(err);
			res.redirect('/jobs/' + req.params.id);
		} else {
			req.flash('success', 'Successfully updated job');
			res.redirect('/jobs/' + req.params.id);
		}
	});
};

module.exports.destroyJob = function(req, res) {
	Job.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			req.flash('error', 'Something went wrong in jobs database');
			console.log(err);
			res.redirect('/jobs');
		} else {
			req.flash('success', 'Successfully deleted job');
			res.redirect('/jobs');
		}
	});
};

module.exports.applyForJob = function(req, res) {
	User.findById(req.params.userID, function(err, student) {
		if (err) {
			req.flash('error', 'Something went wrong in database');
			console.log(err);
			res.redirect('/jobs/' + req.params.id);
		} else {
			Job.findById(req.params.id, function(err, foundJob) {
				if (err) {
					req.flash('error', 'Something went wrong in jobs database');
					console.log(err);
					res.redirect('/jobs/' + req.params.id);
				} else {
					var flag = 0;
					if (req.user.cgpa < foundJob.eligibility) {
						flag = 2;
					}
					foundJob.students.forEach(function(registeredStudent) {
					
						if (registeredStudent._id.equals(student._id)) {
							flag = 1;
						}
					});
					if (flag === 0) {
						foundJob.students.push(student);
						var size = foundJob.students.length;
						foundJob.students[size - 1].name = student.name;
						foundJob.save();
						student.appliedJobs.push(foundJob);
						student.save();
						req.flash('success', 'Successfully applied!!');
						res.redirect('/jobs/' + req.params.id);
					} else if (flag === 1) {
						req.flash('error', 'You can only apply once!');
						return res.redirect('back');
						
					} else if (flag === 2) {
						req.flash('error', 'Required criteria not met!');
						return res.redirect('back');
					}
				}
			});
		}
	});
};

module.exports.jobSetActive = function(req, res) {
	Job.findById(req.params.id, function(err, job) {
		if (err) {
			req.flash('error', 'Something went wrong in jobs database');
			console.log(err);
			res.redirect('/jobs/' + req.params.id);
		} else {
			job.status = 'Active';
			job.save();
			var notif = {
				description: job.name + ' just updated its status!! : Active',
				author: job.name
			};
			Notification.create(notif, function(err, newNotif) {
				if (err) {
					req.flash('error', 'Something went wrong in notifications database');
					console.log(err);
					res.redirect('/jobs/' + req.params.id);
				} else {
					req.flash('success', 'Updated status: Active');
					res.redirect('/jobs/' + req.params.id);
				}
			});
		}
	});
};

module.exports.jobSetInterview = function(req, res) {
	Job.findById(req.params.id, function(err, job) {
		if (err) {
			req.flash('error', 'Something went wrong in jobs database');
			console.log(err);
			res.redirect('/jobs/' + req.params.id);
		} else {
			job.status = 'Interview Phase';
			job.save();
			var notif = {
				description: job.name + ' just updated its status!! : Interview Phase',
				author: job.name
			};
			Notification.create(notif, function(err, newNotif) {
				if (err) {
					req.flash('error', 'Something went wrong in notifications database');
					console.log(err);
					res.redirect('/jobs/' + req.params.id);
				} else {
					req.flash('success', 'Updated status: Interview Phase');
					res.redirect('/jobs/' + req.params.id);
				}
			});
		}
	});
};

module.exports.jobSetOver = function(req, res) {
	Job.findById(req.params.id, function(err, job) {
		if (err) {
			req.flash('error', 'Something went wrong in jobs database');
			console.log(err);
			res.redirect('/jobs/' + req.params.id);
		} else {
			job.status = 'Over';
			job.save();
			var notif = {
				description: job.name + ' just updated its status!! : Over',
				author: job.name
			};
			Notification.create(notif, function(err, newNotif) {
				if (err) {
					req.flash('error', 'Something went wrong in notifications database');
					console.log(err);
					res.redirect('/jobs/' + req.params.id);
				} else {
					req.flash('success', 'Updated status: Over');
					res.redirect('/jobs/' + req.params.id);
				}
			});
		}
	});
};
