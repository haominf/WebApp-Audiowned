// express/node things
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set port number
app.set('port', (/*8888 ||*/ process.env.PORT || 5000));
// set the view engine to ejs
app.set('view engine', 'ejs');
// make express look in the views/pages directory for assets (css/js/img)
app.set('views', __dirname + '/views/pages');
// virtual path prefix - "puts" css/js/img in this dir
app.use('/static', express.static('public')).use(cookieParser());

// mongo things
var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL || 'mongodb://localhost/';
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
    db = databaseConnection;
});

// spotify things
var spotify_api = "https://api.spotify.com/";
var client_id = '67fd18a6482b41a5aa0c8b71b1517989'; // Your client id
var client_secret = '7a42b826ed224ed0a94634b2d12152b6'; // Your secret
var redirect_uri = 'http://localhost:' + app.get('port') + '/callback' || 'https://audiowned.herokuapp.com/callback';
var auth_code, refresh_token;

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

// set the home page route
app.get('/', function(req, res) {
    res.render('index');
});

app.get('/play', function(req, res) {
    res.render('play_tracks');
});

app.post('/login', function(req, res) {
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
    var scope = 'user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client.client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        })
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send('hello');
});

app.get('/home', function(req, res) {
    res.render('home&loading', {Name:player_name, Pic_URL:player_pic});
});

app.get('/login', function(req, res) {
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
    // app requests authorization
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
    res.render('home&loading', {Name:player_name, Pic_URL:player_pic});
});

app.get('/matched', function(req, res) {
    /*
    db.collection.find().sort({time:-1}).limit(1).toArray(
        function (error, result) {
        if (error) {
            res.send(500);
        }
        else {
            res.send(result);
        }
    });
    */
    res.render('matched', {Name:player_name, Pic_URL:player_pic});
});

app.post('/game', function(req, res) {
    res.render('game', {Name:player_name, Pic_URL:player_pic});
});

app.post('/submit', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.sendStatus(200);
    // if (req.body.round == 1) {
    //     var info = {
    //         "username": req.body.username,
    //         "pic": req.body.pic,
    //         "scores": [req.body.score]
    //     }

    //     db.collection('users', function (error, coll) {
    //         coll.insert(info, function(error) {
    //             if (error) {
    //                 res.send(500);
    //                 return;
    //             }
    //         });
    //     });

    // }
    // else {
    //     // db.users.update({username: req.body.username}, {$push: {scores: req.body.score}});
    // }

    // console.log("post");
    // console.log(req.body.number);
    // console.log("hi");

    // console.log('enter matched');
    //res.render('matched', {Name:player_name, Pic_URL:player_pic});
});

app.get('/game', function(req, res) {
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
            form: {
                grant_type: 'refresh_token',
                refresh_token: refresh_token
            },
        json: true
    };

    // every time we get things from spotify api, refresh token & get access token
    request.post(authOptions, (err, response, body) => {
        if (!err && response.statusCode == 200) {
            var access_token = body.access_token;
            refresh_token = body.refresh_token;

            // always get Spotify's Today's Top Hits playlist lol
            var playlist_id = '5FJXhjdILmRA2z5bvz4nzf';
            var query = querystring.stringify( { 'market': 'US', 'limit': 40 });
            var options = {
                url: spotify_api + 'v1/users/spotify/playlists/' + playlist_id + '/tracks?' + query,
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            }

            // use the access token to access the Spotify Web API
            request.get(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var tracks = body.items;
                    music = new Array();
                    for (var i = 0; i < tracks.length; i++) {
                        music[i] = {
                            'name':tracks[i].track.name,
                            'artist':tracks[i].track.artists[0].name,
                            'id':tracks[i].track.id,
                            'url':tracks[i].track.preview_url
                        };
                    }
                    res.render('game', {MUSIC: music, Name:player_name, Pic_URL:player_pic});
                }
                else {
                    console.log('u fuked up');
                }
            });
        }
    });
});

app.post('/submit', function(req, res) {
    // console.log(req.body);
    // console.log('in game');
    res.render('game', {Name:player_name, Pic_URL:player_pic});
});

app.get('/callback', function(req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter
    var code = req.query.code || null;
    auth_code = code;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
        }));
    }
    else {
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
        // send request to spotify
        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                var access_token = body.access_token;
                refresh_token = body.refresh_token;
                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };
                // use the access token to access the Spotify Web API
                request.get(options, function(error, response, body) {
                    player_json = body;
                    player_name = player_json['display_name'];
                    player_pic = player_json['images'][0]['url'];
                    res.render('home&loading', {Name:player_name, Pic_URL:player_pic});
                });
            }
            else {
                res.redirect('/#' +
                querystring.stringify({
                    error: 'invalid_token'
                }));
            }
        });
    }
});

app.get('/refresh_token', function(req, res) {
    // requesting access token from refresh token
    refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
            form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };
    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

app.listen(app.get('port'), function() {
    console.log('App is running on port', app.get('port'));
});
