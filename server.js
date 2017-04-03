var express = require('express');
var fs = require('fs');
var app = express();

var port = process.env.PORT || 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');
// make express look in the public directory for assets (css/js/img)
app.set('views', __dirname + '/views/pages');
// virtual path prefix - "puts" css/js/img in this dir
app.use('/static', express.static('public'));

// set the home page route
app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log('App running on localhost:' + port);
});
