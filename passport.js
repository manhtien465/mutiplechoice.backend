const passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local')
var bcrypt = require("bcryptjs")
const Users = require('./schema/user.schema')
const key = require("./config/index")
var jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken("authorization");   //  Tên cần đúng như thế này
jwtOptions.secretOrKey = key.secretkey;
passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {


    Users.findOne({ _id: payload.sub }, function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}))
//LOCAL STRETEGY
passport.use(new LocalStrategy({
    usernameField: 'email',

},
    async (email, password, done) => {
        try {
            const user = await Users.findOne({ email })
            console.log(user);
            console.log(password);
            if (!user) {

                return done(null, false, { msg: "email or password not correct" })
            }

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (isMatch) {
                    if (user.isBan == true) {
                        return done(null, false, { msg: "please active account to login" })
                    }
                    return done(null, user)

                }
                return done(null, false, { msg: "email or password not correct" })
            })

        } catch (error) {
            return done(null, false)
        }

    }
))