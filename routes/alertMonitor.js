var config = require('../config/config');
var http = require('http');
var CronJob = require('cron').CronJob;
var models  = require('../models');
var efsms = require('../routes/machinesCron');

console.log("---- alertMonitor " + config.app.name);
var registerTool = new CronJob({
    cronTime: '*/1 * * * * *',
    onTick: function() {

        var headers = {
            'Content-Type': 'application/json'
        };

        var options = {
            host : config.measure.host,
            port : config.measure.port,
            path : config.measure.alertPath + '?id='+config.app.name,
            method : 'GET',
            headers: headers
        };
        // AlertReport alerts = restTemplate.getForObject(serverURL + "api/analysis/alert/list/?id=" + analysisToolId,AlertReport.class);

        http.get(options, function (res) {
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
    var instances = '';
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

            // get measure instances
            var headers = {
                'Content-Type': 'application/json'
            };

            var options = {
                host : config.measure.host,
                port : config.measure.port,
                path : config.measure.projectInstances + projectId,
                method : 'GET',
                headers: headers
            };

            var r = http.get(options, function (res) {
                res.setEncoding('utf8');
                res.on("data", function (data) {
                    // console.log("BODY data: " + data);
                    instances += data;
                });
                res.on('end', function () {
                    instances = JSON.parse(instances);
                })
            });
            r.end();
            models.Efsm.findAll().then(function (machines) {
                machines.forEach(function (machine) {
                    console.log("creating analysis for machine " + machine);
                    models.Analysis.create({
                        status : false,
                        name: machine.name,
                        description: machine.get('description'),
                        customThreshold: machine.get('threshold'),
                        customMessage: machine.get('message'),
                        ProjectId: project.get('id'),
                        EfsmId: machine.get('id')
                    }).then(function (analysis) {
                        console.log("Analysis created with id : " + analysis.get('id'));
                        console.log("for machine id : " + machine.get('id'));

                        models.Measure.findAll({
                            where: {EfsmId: machine.get('id')}
                        }).then(function (measures) {
                            measures.forEach(function (measure) {
                                instanceName = "";
                                // get measure instance for measure
                                for(var i = 0; i < instances.length; i++) {
                                    if(instances[i].measureName == measure.get('name')) {
                                        instanceName = instances[i].instanceName;
                                    }
                                }
                                    models.Instance.create({
                                        name: instanceName,
                                        AnalysisId: analysis.get('id'),
                                        MeasureId: measure.get('id')
                                    })
                            })
                        });
                        // set instances
                        // run machine for analysis
                        efsms.initMachineAnalysis(analysis.get('id'));
                    })
                })
            })
        }

        var json = JSON.stringify({
            "projectAnalysisId": projectAnalysisId,
            "viewUrl": config.app.historyURL+project.get('id'),
            "configurationUrl": config.app.configureURL+project.get('id')
        });

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': json.length
        };

        var options = {
            host : config.measure.host,
            port : config.measure.port,
            path : config.measure.configurePath,
            method : 'PUT',
            headers: headers
        };

        var req = http.request(options, function (res) {
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
        where: {AnalysisId: null}
    })).then(models.Instance.destroy({
        where: {AnalysisId: null}
    }));


}

registerTool.start();

module.exports = registerTool;