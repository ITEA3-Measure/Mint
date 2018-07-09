var config = require('../config/config');
var express = require('express');
var http = require('http');
var CronJob = require('cron').CronJob;

var mmt = require('../utils/mmt-correlator/src/efsm');
var redis = require("redis");
var util = require("util");
var models  = require('../models');

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
    cronTime: config.app.measurementsCronTime,
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
                // GET MEASUREMENTS
                var json = JSON.stringify({
                    "measureInstance": instance.name,
                    "page": 1,
                    "pageSize": 1
                });

                var headers = {
                    'Content-Type': 'application/json',
                    'Content-Length': json.length
                };
                var options = {
                    host :  config.measure.host,
                    path :  config.measure.measurementsPath,
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
                            var value = measurement.value;
                            publisher.publish('new_'+instance.Measure.name+"_"+instance.Analysis.id, JSON.stringify(MMT.attributeJSON(measurement.postDate, instance.Measure.name, value, [], 'i1')));
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
