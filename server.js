require('dotenv').config();
const { getMysqlInstance } = require('./Database/connection');
const express=require('express');
const cors=require('cors');
const passport=require('passport');
const { errorHandler } = require('./middleware/error');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express()
const port = process.env.PORT||5000;
var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.authenticate('session'));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server Running')
})

app.listen(port, () => {
    console.log(`Server listening to port ${port}`);
})
getMysqlInstance().then(res=>{
    res.query(`create table if not exists user(id varchar(255) primary key,name varchar(255),email varchar(255) not null,avatar varchar(255));`);
    res.query(`create table if not exists token(uid varchar(255) not null,foreign key (uid) references user(id) on delete cascade,refreshtoken varchar(255) not null);`)
    console.log(`Successfully connected the database`);
}).catch(err=>{
    console.log(`Could not connect to database`);
})
passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.GOOGLE_CALLBACK_URL
},
function(accessToken, refreshToken, profile, cb) {
    return cb(null, {profile,accessToken});
}
));
passport.serializeUser(function (user, cb) {
    return cb(null, user);
});

passport.deserializeUser(function (user, cb) {
    return cb(null, user);
});
const auth=require('./routes/auth');
const user=require('./routes/user');
app.use('/auth',auth);
app.use('/user',user);
app.use(errorHandler);