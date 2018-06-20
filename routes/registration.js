var config = require('../config/config');
var express = require('express');
var router = express.Router();
var http = require('http');
var models  = require('../models');

Registration = {
    init : function () {
        var json = JSON.stringify({
            "configurationURL": config.app.configurationURL,
            "description": config.app.description,
            "name": config.app.name
        });
        console.log("JSON: " + json);
        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': json.length
        };

        var options = {
            host : config.measure.host,
            port : config.measure.port,
            path : config.measure.registrationPath,
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

        process.on('uncaughtException', function (err) {
            console.log(err);
        });

        req.write(json);

        req.end();
    }
}

/* Register Tool */
router.get('/', function(req, res, next) {

    var json = JSON.stringify({
        "configurationURL": config.app.configurationURL,
        "description": config.app.description,
        "name": config.app.name
    });
    console.log("JSON: " + json);
    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': json.length
    };

    var options = {
        host : config.measure.host,
        port : config.measure.port,
        path : config.measure.registerPath,
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

module.exports = Registration;