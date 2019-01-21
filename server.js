const express = require('express');
const bodyParser = require('body-parser');
var session = require('express-session');
var morgan = require('morgan');
var fs = require('fs');
//const mysql = require('mysql'); --1
// create express app
const app = express();
var PORT = process.env.PORT || 1521;
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())
// Configuring the database
//const dbConfig = require('./config/database.config.js'); --1
//require('./app/routes/note.routes.1.js')(app, dbConfig, mysql); --1


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
morgan.token('res', function getId(res) {
	return res;
});

var accessLogStream = fs.createWriteStream(__dirname + '/logs/access.log', {flags: 'a'});

app.use(morgan(':req[body] :res[body]', {stream: accessLogStream}));

require('./app/routes/user.routes.js')(app);

app.use('/', express.static(__dirname + '/client'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

// listen for requests
app.listen(PORT, function () {
    console.log('Server running, Express is listening... http://localhost:'+PORT);
});