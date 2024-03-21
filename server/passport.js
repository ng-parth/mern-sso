const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require('./models/User');
const session = require("express-session");
const MongoStore = require("connect-mongo");

const initialize = app => {
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.CLIENT_ID,
				clientSecret: process.env.CLIENT_SECRET,
				callbackURL: "/auth/google/callback",
				scope: ["profile", "email"],
			},
			async function (accessToken, refreshToken, profile, callback) {
				console.log('Profile: ', profile);
				const newUser = {
					id: profile.id,
					googleId: profile.id,
					displayName: profile.displayName,
					firstName: profile.name.givenName,
					lastName: profile.name.familyName,
					image: profile.photos[0].value,
					email: profile.emails[0].value,
					isEmailVerified: profile.emails[0].verified,
					isProfileCompleted: false,
					ssoProvider: 'google',
				}

				try {
					let user = await User.findOne({ googleId: profile.id })

					if (user) {
						callback(null, user)
					} else {
						user = await User.create(newUser)
						callback(null, user)
					}
				} catch (err) {
					console.error(err)
				}
				// callback(null, profile._json);
			}
		)
	);

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user, done) => {
		done(null, user);
	});
	app.use(
		session({
			secret: process.env.MONGO_SESSION_SECRET,
			resave: false,
			saveUninitialized: false,
			store: MongoStore.create({mongoUrl: process.env.MONGO_URI,}),
		})
	)

	app.use(passport.initialize());
	app.use(passport.session());
}

module.exports = { initialize };
