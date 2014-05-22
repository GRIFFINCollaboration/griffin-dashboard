express = require("express");		
app = express();					// init app obj


/*
passport = require('passport');		// user authentication
LocalStrategy = require('passport-local').Strategy; 
bcrypt = require('bcrypt');			// hashes passwords before putting them in DB
SALT_WORK_FACTOR = 10;				// how many times to scramble a pass before returning the final hash?
*/

// setup the app
app.set('views', __dirname + '/views');
app.use('/static', express.static(__dirname + '/static'));


// Load our routes
require('./routes.js');

/*
 * User Authentication Config
 */
/*
// configure the passport authentication
passport.use(new LocalStrategy(
    function(email, password, done) {
		connect(function(err, db) {
			if(err){
				console.log('Login connect failure')
				console.log(err)
			}
			db.collection('Users', function(er, collection) {
				if(er){
					console.log('Login database connection failure')
					console.log(er)
				}
			    collection.findOne({ email: email }, function(err, user) {
			    	if(err){
						console.log('Login database lookup failure')
						console.log(err)
					}
			    	if (!user) {
			    		console.log('Email not found :(')
			    		return done(null, false, { message: 'Email not found.' });
			    	}
				    bcrypt.compare(password, user.Pass, function(err, isMatch) {
				    	if(err){
							console.log('Login password validation failure')
							console.log(err)
						}
				        if(isMatch)
					        return done(null, user)
					    else{
					    	console.log('Bad password :(')
					    	return done(null, false, { message: 'Bad Password.' });
					    }
				    });
			    });
			});
		});
    })
);


// passport serialize / deserialize magics
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {

	done(null, obj);
});
*/

var port = process.env.PORT || 2154;
app.listen(port, function() {
  console.log("Listening on " + port);
});