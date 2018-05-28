var express = require('express');
var http = require('http');
var propertiesReader = require('properties-reader');
var properties = propertiesReader('./config/config.ini');
var property = properties.get('dev.measure-platform.url');
var CronJob = require('cron').CronJob;
var models  = require('../models');

var registerTool = new CronJob({
    cronTime: '*/1 * * * * *',
    onTick: function() {
        //console.log('job 2 ticked');

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
            // console.log('STATUS: ' + res.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            var body = '';
            res.on("data", function (data) {
                // console.log("BODY data: " + data);
                body += data;
            });
            res.on('end', function() {
                // console.log("BODY end: " + body);
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
                    else if(alert.alertType == "ANALYSIS_DESABLE") {
                        // delete project and analysis
                        var analysisId;
                        var projectId = alert.projectId;
                        var properties = alert.properties;
                        deleteProject(projectId);
                    }

                });

                // console.log("--BODY 2 : " + body);
            });
        });
    },
    start: false,
    timeZone: 'America/Los_Angeles'
});

function configurate(projectId, projectAnalysisId) {
    console.log("------ configurate ------");
    console.log("projectId " + projectId);
    console.log("projectAnalysisId " + projectAnalysisId);

    // create project in local DB and Analysis
    var projectValues = {
        name: "",
        measureProjectId: projectId,
    }

    models.Project.findOrCreate({
        where: {measureProjectId: projectId},
        defaults: {name : ""}
    }).spread(function (project, created) {
        console.log("PROYECT CREATED");
        if(created) {
            models.Efsm.findAll().then(function (machines) {
                machines.forEach(function (machine) {
                    console.log("creating analysis for machine " + machine);
                    models.Analysis.create({
                        status : true,
                        name: machine.name,
                        description: machine.get('description'),
                        customThreshold: machine.get('threshold'),
                        customMessage: machine.get('message'),
                        ProjectId: project.get('id'),
                        EfsmId: machine.get('id')
                    })
                })
            })
        }

        var json = JSON.stringify({
            "projectAnalysisId": projectAnalysisId,
            "viewUrl": properties.get('dev.analysis-tool.historyURL')+project.get('id'),
            "configurationUrl": properties.get('dev.analysis-tool.configureURL')+project.get('id')
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
    })
}

function deleteProject(projectId) {
    console.log("------ delete project ------");
    console.log("projectId " + projectId);

    models.Project.destroy({
        where: {measureProjectId: projectId}
    }).then(models.Recommendation.destroy({
        where: {analysisId: null}
    }));


}

registerTool.start();

module.exports = registerTool;