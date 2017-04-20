
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var client_id = '67fd18a6482b41a5aa0c8b71b1517989'; // Your client id
var client_secret = '7a42b826ed224ed0a94634b2d12152b6'; // Your secret
var redirect_uri = 'https://audiowned.herokuapp.com/callback'; // local: 'http://localhost:8888/callback'
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

// set port number
app.set('port', (process.env.PORT || 8888));
// set the view engine to ejs
app.set('view engine', 'ejs');
// make express look in the views/pages directory for assets (css/js/img)
app.set('views', __dirname + '/views/pages');
// virtual path prefix - "puts" css/js/img in this dir
app.use('/static', express.static('public')).use(cookieParser());

// set up mongo for future use
var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL || 'mongodb://localhost/';
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
    db = databaseConnection;
});

// set the home page route
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/home', (req, res) => {
    res.render('home');
});

// var username_created;
// app.post('/id', (req, res) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'POST');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype');

//     username_created = req.body.id;
//     console.log('created username: ' + username_created);
//     //to be add into mongodb

//     res.send(null);
// });

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/loading', function(req, res) {
  res.render('home', {Name:player_name, Pic_URL:player_pic});
});

app.get('/matched', function(req, res) {
  console.log('enter matched');
  res.render('matched', {Name:player_name, Pic_URL:player_pic});
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log('this is the json body:');
          console.log(body);
          player_json = body;
          player_name = player_json['display_name'];
          player_pic = player_json['images'][0]['url'];
          res.render('home');
        });
        // console.log('Tokens:');
        // console.log('access token: ' + access_token);
        // console.log('refresh access token: ' + refresh_token);
        // we can also pass the token to the browser to make requests from there

        // res.redirect('/#' +
        //   querystring.stringify({
        //     access_token: access_token,
        //     refresh_token: refresh_token
        //   }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

// app.get('/refresh_token', function(req, res) {

//   // requesting access token from refresh token
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token;
//       res.send({
//         'access_token': access_token
//       });
//     }
//   });
// });

app.listen(app.get('port'), function() {
    console.log('App is running on port', app.get('port'));
});
