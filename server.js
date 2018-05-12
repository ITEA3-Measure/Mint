/*
const express = require('express');
const Sequelize = require('sequelize');
const app = express();
const http = require('http');
const mysql = require('mysql2');

var propertiesReader = require('properties-reader');
var properties = propertiesReader('./config/config.ini');
var property = properties.get('dev.measure-platform.url');
console.log("dev.measure-platform.url : " + property);

app.use(express.static('public'));
app.set('view engine', 'ejs');

const sequelize = new Sequelize({
    database: properties.get('dev.mysql.datasource.database'),
    username: properties.get('dev.mysql.datasource.username'),
    password: properties.get('dev.mysql.datasource.password'),
    dialect: 'mysql',
    host: properties.get('dev.mysql.datasource.host'),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

//check connection
sequelize.authenticate()
    .then(function () {
        console.log('Connection has been established successfully.');
    }).catch(function(err) {
    console.error('Unable to connect to the database:', err)
})
    .done();

/!*const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'mint_db'
});

//Database connection
connection.connect(function (err) {
    if(err) {
        console.log("Error connecting Database : " + err.stack);
        return;
    } else {
        console.log("Database is connected ...");
    }
});
*!/

app.get('/', function (req, res) {
    res.render('index', { title: 'ASDF' });
});

app.get('/config', function (req, res) {
    res.render('config');
});

app.get('/history/:project', function (req, res) {
    var project = req.params.project;
    console.log("History Project " + project);
    connection.query('SELECT 1', function (error, results, fields) {
        if(error) {
            throw error;
            res.render('history', ({"status": null, "error": "Error, please try again", "response": results}));
        }
        // connected!
        res.render('history', ({"status": 200, "error": null, "response": results}));
    });
});

app.get('/registerTool', function (req, res) {
    res.render('register');
});

app.post('/registerTool', function (req, res) {
    res.redirect('/');

    var json = JSON.stringify({
        "configurationURL": properties.get('analysis-tool.configurationURL'),
        "description": properties.get('analysis-tool.description'),
        "name": properties.get('analysis-tool.name')
    });
    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': json.length
    };

    var options = {
        host : 'localhost',
        port : 8085,
        path : '/api/analysis/register',
        method : 'PUT',
        headers: headers
    };

        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on("data", function (chunk) {
                console.log("BODY: " + chunk);
            });
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        req.write(json);

        req.end();
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

/!*
var options = {
    host: 'localhost',
    port: 8085,
    path: '/api/analysis/register',
    method: 'POST'
};


var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
    });
});

req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.write('data\n');
req.end();*!/
*/
