var express = require('express');
var router = express.Router();
var http = require('http');
var models  = require('../models');
var propertiesReader = require('properties-reader');
var properties = propertiesReader('./config/config.ini');
var property = properties.get('dev.measure-platform.url');
console.log("dev.measure-platform.url : " + property);

/* Register Tool */
router.get('/', function(req, res, next) {

    var json = JSON.stringify({
        "configurationURL": properties.get('dev.analysis-tool.configurationURL'),
        "description": properties.get('dev.analysis-tool.description'),
        "name": properties.get('dev.analysis-tool.name')
    });
    console.log("JSON: " + json);
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
        var output = '';
        res.on("data", function (data) {
            console.log("BODY: " + data);
            output += data;
        });
/*        res.on('end', function() {
            output = JSON.parse(output);
            console.log("--BODY 2 : " + output);
        });*/
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(json);

    req.end();
    res.send(req.output);
});

module.exports = router;