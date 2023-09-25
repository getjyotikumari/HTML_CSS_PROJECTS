const auth          = require("../controllers/auth"),
      express       = require('express'),
      isAuth        = require('../controllers/authMiddlewares').isAuth,
      isAdmin       = require('../controllers/authMiddlewares').isAdmin,
      passport      = require('passport'),
      router        = express.Router();
var User = require('../models/user');
 



router.get('/', (req, res) => {
	res.render('register');
});

router.post('/', async (req, res) => {
	try {
		let user = new User({
			username: req.body.username,
            name:req.body.name,
            branch:req.body.branch,
            cgpa:req.body.cgpa,
            admin:req.body.isAdmin
			
		});
		let registeredUser = await User.register(user, req.body.password);
		req.login(registeredUser, function(err) {
			if (err) {
				req.flash('error', 'registration failed, please try again');
				console.log(err);
				return res.redirect('/register');
			}
			req.flash('success', 'welcome user');
			res.redirect('/home');
		});
	} catch (error) {
		req.flash('error', 'registration failed, please try again');
		console.log(error);
		return res.redirect('/');
	}
});

router.get('/login', (req, res) => {
	res.render('login');
});


router.post('/login',passport.authenticate('local',
 {  
    failureRedirect: '/login',
    failureFlash: 'Invalid username or password.',
    failureFlash: true,
    successFlash: 'Welcome to HierHub!'
}),
 (req,res)=>{
   
	res.redirect('/home');
})

//REGISTER
router.get("/register",isAdmin, auth.registerGet);
router.post("/register",isAdmin,auth.registerPost);

router.get('/logout',(req,res)=>{
 
  req.logOut((err)=>{
    if(err){
      req.flash('error',"error while logout",err)
    }
   
    res.redirect('/login')
  })
  req.flash("success","see you later!!")
  res.redirect('/login') 
})


module.exports = router;