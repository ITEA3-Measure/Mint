var config = require('../config/config');
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

var settings = {
    eventbus: {
        type: config.redis.type,
        host: config.redis.host,
        port: config.redis.port
    }
};

mmt.init(settings);

var publisher = redis.createClient(settings.eventbus.port, settings.eventbus.host);
publisher.config("SET","notify-keyspace-events", "KEA");

var cronMetric = new CronJob({
    cronTime: '*/10 * * * * *',
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
/*                console.log(instance.Analysis.Efsm.file);
                console.log("     - " + instance.Measure.name + " : " + instance.name);*/
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
                var options = {
                    host :  '194.2.241.244',
                    path :  '/measure/api/measurement/find',
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
                        if(body.length == 0) {
                            console.log(" - NO DATA FOR INSTANCE " + instance.name);
                        }
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
                req.write(json);
                req.end();
            });
        });
    }
});

Measurements = {
    init: function () {
        cronMetric.start();
    }
}

module.exports = Measurements;
