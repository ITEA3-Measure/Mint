var express = require('express');
var http = require('http');
var CronJob = require('cron').CronJob;

var mmt = require('../utils/mmt-correlator/src/efsm');
var redis = require("redis");
var util = require("util");
var models  = require('../models');
// Ver como se llaman las instancias de las metricas que necesito en el proyecto
// almacenar el nombre y revisar cada cierto tiempo que no haya cambiado
// por cada instancia correr el cron
// TODO: Validar que las metricas que necesito existan al momento de activar una máquina
// TODO: Setear manualmente las métricas necesarias?
// TODO: actualizar maquinas activas y valores de threshold en cron

if(process.env.REDIS_URL) {
    console.log("process.env.REDIS_URL : " + process.env.REDIS_URL);
    var redisUrl = (process.env.REDIS_URL).split(":");
    var settings = {
        eventbus: {
            type: redisUrl[0],
            host: redisUrl[2],
            port: redisUrl[3]
        }
    };
}
else {
    console.log("No REDIS_URL");
    var settings = {
        eventbus: {
            type: 'redis',
            host: '127.0.0.1',
            port: 6379
        }
    };
}

mmt.init(settings);

var publisher = redis.createClient(settings.eventbus.port, settings.eventbus.host);
publisher.config("SET","notify-keyspace-events", "KEA");

var cronMetric = new CronJob({
    cronTime: '*/100 * * * * *',
    onTick: function () {
        console.log('job ticked');
        // find all measurements from analysis that are enabled
        models.Instance.findAll({
            include: [
                {model: models.Measure,
                require: false,
               },
                {model: models.Analysis,
                    where: {
                        status: true
                    },
                    require: true,
                    include : [
                        {model: models.Efsm,
                            require: false}
                    ]}
            ]
        }).then(function (instances) {
            instances.forEach(function (instance) {
                console.log(instance.Analysis.Efsm.file);
                console.log("     - " + instance.Measure.name + " : " + instance.name);
                // GET MEASUREMENTS
                var json = JSON.stringify({
                    "measureInstance": instance.name,
                    "page": 1,
                    "pageSize": 1
                });
                // console.log("JSON: " + json);

                var headers = {
                    'Content-Type': 'application/json',
                    'Content-Length': json.length
                };
                // TODO: take from config
                var options = {
                    host : '194.2.241.244',
                    // port : 8085,
                    path : '/measure/api/measurement/find',
                    method : 'POST',
                    headers: headers
                };
                var req = http.request(options, function (res) {
                    res.setEncoding('utf8');
                    var body = '';
                    res.on("data", function (data) {
                        // console.log("CONFIG BODY: " + data);
                        body+=data.toString();
                    });
                    res.on("end", function () {
                        body = JSON.parse(body);
                        if(body.length > 0) {
                            var measurement = body[0].values;
                            // TODO: REMOVE RANDOM
                            var rand = measurement.value + Math.floor(Math.random() * 100);
                            console.log("-- " + measurement.postDate + " - " + measurement.value + " - random : " + rand);
                            publisher.publish('new_'+instance.Measure.name, JSON.stringify(MMT.attributeJSON(measurement.postDate, instance.Measure.name, rand, [], 'i1')));
                        }
                    });
                });

                req.on('error', function(e) {
                    console.log('problem with request: ' + e.message);
                });

                var output = req.output;
                req.write(json);
                req.end();
            });
        });
    /*    models.Analysis.findAll({
            where: {
                status: true
            },
            include: [
                {model: models.Efsm,
                    require: false},
                {model: models.Project,
                    require: false},
                {model: models.Instance,
                    require: false}
            ]
        }).then(function (analyses) {
            analyses.forEach(function (analysis) {
                console.log(analysis.Efsm.file);
                // console.log(analysis.Instances);
                analysis.Instances.forEach(function (instance) {
                    console.log("    - " + instance.get('name'));
                    // get measurement value and put in redis
                    // GET MEASUREMENTS
                    var json = JSON.stringify({
                        "measureInstance": instance.get('name'),
                        "page": 1,
                        "pageSize": 1
                    });
                    console.log("JSON: " + json);

                    var headers = {
                        'Content-Type': 'application/json',
                        'Content-Length': json.length
                    };
                    // TODO: take from config
                    var options = {
                        host : '194.2.241.244',
                        // port : 8085,
                        path : '/measure/api/measurement/find',
                        method : 'POST',
                        headers: headers
                    };
                    var req = http.request(options, function (res) {
                        console.log('CONFIG STATUS: ' + res.statusCode);
                        console.log('CONFIG HEADERS: ' + JSON.stringify(res.headers));
                        res.setEncoding('utf8');
                        var body = '';
                        res.on("data", function (data) {
                            // console.log("CONFIG BODY: " + data);
                            body+=data.toString();
                        });
                        res.on("end", function () {
                            console.log("No more data in response");
                            body = JSON.parse(body);
                            body.forEach(function(measurement) {
                                measurement = measurement.values;
                                console.log("-- " + measurement.postDate + " - " + measurement.value);
                                publisher.publish('new_number_issues', JSON.stringify(MMT.attributeJSON(measurement.postDate, instance.get('name'), measurement.value, [], 'i1')));
                            });
                        });
                    });

                    req.on('error', function(e) {
                        console.log('problem with request: ' + e.message);
                    });

                    var output = req.output;
                    req.write(json);
                    req.end();
                })
            });
        });*/
    }
});

Measurements = {
    init: function () {
        cronMetric.start();
    }
}

module.exports = Measurements;
