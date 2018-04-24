var express = require('express');
var router = express.Router();
var http = require('http');
var propertiesReader = require('properties-reader');
var properties = propertiesReader('../config/config.ini');
var property = properties.get('dev.measure-platform.url');
var CronJob = require('cron').CronJob;

var job1 = new CronJob({
    cronTime: '*/1 * * * *',
    onTick: function() {
        console.log('job 1 ticked');
    },
    start: false
});

var job2 = new CronJob({
    cronTime: '*/1 * * * * *',
    onTick: function() {
        console.log('job 2 ticked');

        var headers = {
            'Content-Type': 'application/json'
        };

        var options = {
            host : 'localhost',
            port : 8085,
            path : '/api/analysis/alert/list/?id=MiNT',
            method : 'GET',
            headers: headers
        };
        // AlertReport alerts = restTemplate.getForObject(serverURL + "api/analysis/alert/list/?id=" + analysisToolId,AlertReport.class);

        http.get(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            var body = '';
            res.on("data", function (data) {
                console.log("BODY data: " + data);
                body += data;
            });
            res.on('end', function() {
                console.log("BODY end: " + body);
                body = JSON.parse(body);
                var alerts = body.alerts;
                alerts.forEach(function (alert) {
                    console.log( alert.alertType);
                    if(alert.alertType == "ANALYSIS_ENABLE"){
                        var analysisId;
                        var projectId = alert.projectId;
                        var properties = alert.properties;
                        properties.forEach(function (prop) {
                            console.log("*** PROP : " + prop);
                            console.log("prop[property] : " + prop["property"]);
                            console.log("prop[value] : " + prop["value"]);
                            if(prop.property == "ANALYSISID"){
                                analysisId = prop.value;
                            }
                        });
                        configurate(projectId, analysisId);
                    }

                });

                console.log("--BODY 2 : " + body);
            });
        });

/*        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        req.write(json);

        req.end();
        res.send(req.output);*/
    },
    start: false,
    timeZone: 'America/Los_Angeles'
});

function configurate(projectId, projectAnalysisId) {
    console.log("------ configurate ------");
    console.log("projectId " + projectId);
    console.log("projectAnalysisId " + projectAnalysisId);

    var json = JSON.stringify({
        "projectAnalysisId": projectAnalysisId,
        "viewUrl": properties.get('dev.analysis-tool.historyURL')+projectId,
        "configurationUrl": properties.get('dev.analysis-tool.configureURL')+projectId
    });
    console.log("JSON: " + json);
    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': json.length
    };
    var options = {
        host : 'localhost',
        port : 8085,
        path : '/api/analysis/configure',
        method : 'PUT',
        headers: headers
    };
    var req = http.request(options, function (res) {
        console.log('CONFIG STATUS: ' + res.statusCode);
        console.log('CONFIG HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        var output = '';
        res.on("data", function (data) {
            console.log("CONFIG BODY: " + data);
            output += data;
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(json);

    req.end();
}

job1.start();
job2.start();
console.log('job1 status', job1.running); // job1 status undefined
console.log('job2 status', job2.running); // job2 status undefined