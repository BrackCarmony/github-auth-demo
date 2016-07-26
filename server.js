var express = require('express');
var app = express();
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var axios = require('axios');

var session = require('express-session');
var serverConfig = require('./config/serverConfig');
var github = require('octonode');

// var githubClient = github.client({
//   id:serverConfig.githubId,
//   secret: serverConfig.githubSecret});

var githubClient = github.client({
  username:serverConfig.username,
  password:serverConfig.password
})

app.use(express.static(__dirname+'/public'));

var awesomeTeam = githubClient.team(2073154);
var awesomeOrg = githubClient.org('EvilTwinCo');

awesomeOrg.teams(function(err, data, headers){
  console.log(err);
  console.log(data);
  console.log(arguments.length);
})


awesomeTeam.info(function(err, data){
  //console.log("err",err);
  //console.log("data",data);
})

passport.serializeUser (function(user, done){
  console.log("serialize" , user);
  done(null, user);
});

passport.deserializeUser (function(user, done){
  console.log("deserialize", user);
  done(null, user)
});

passport.use(new GitHubStrategy({
    clientID: serverConfig.githubId,
    clientSecret: serverConfig.githubSecret,
    callbackURL: "http://192.168.1.198:8087/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    cb(null, profile._json);
    // User.findOrCreate({ githubId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
  }
));

app.use(session({
  secret: 'githubsecretofsecreton',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
}))

app.use(passport.initialize());
app.use(passport.session());


app.get('/auth/me', function(req, res, next){
  console.log("req.user", req.user);
  res.send(req.user);
})
app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("Github Success");
    res.redirect('/');
  });

app.get('/addUserToProject', function(req, res, next){
  awesomeTeam.addMembership(req.user.login, function(err, data, headers){
    if (err){
      console.log(err);
    }else{
      console.log(data);
    }
  })
})


app.listen(8087, function() {
  console.log("Listening on port 8087");
})
