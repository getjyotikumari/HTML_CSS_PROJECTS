// REQUIRING NPM MODULES
const bodyParser            = require('body-parser'),
      express               = require('express'),
      flash                 = require('connect-flash'),
     
      methodOverride        = require('method-override'),
      mongoose              = require('mongoose'),
      passport              = require('passport'),
      User                  = require('./models/user'),
      localStrategy =       require('passport-local'),
      
      session               = require('express-session');
const app = express();
require("dotenv").config();

//MONGOOSE CONNECTION

const uri = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);
mongoose
.connect(uri, { useNewUrlParser: true })
.then(() => console.log("DB working!"))
.catch((error) => console.log(error));;


app.locals.moment = require('moment');

var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);


app.use(
	session({
		secret: "sessionPass",
		resave: false,
		saveUninitialized: true,
		cookie: {
			httpOnly: true,
			// secure: true,
			expires: Date.now() + 1000 * 60 * 60 * 24,
			maxAge: 1000 * 60 * 60 * 24
		}
	})
);

// ! DATABASE MODELS


// ! PASSPORT CONFIGURATION
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// require('./controllers/passport');


//LOCAL CONFIGURATION
app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


//REQUIRING ROUTES
const authRoutes          = require("./routes/auth"),
      homeRoutes          = require("./routes/home"),
      jobRoutes           = require("./routes/jobs"),
      notificationRoutes  = require("./routes/notifications"),
      questionRoutes      = require("./routes/questions"),
      userRoutes          = require("./routes/users");
      

//USING ROUTES
app.use("/", authRoutes);
app.use("/", homeRoutes);
app.use(jobRoutes);
app.use(notificationRoutes);
app.use(questionRoutes);
app.use(userRoutes);


//PORT CONNECTION
const port = process.env.PORT || 3001;
app.listen(port, function () {
  console.log("server started");
});