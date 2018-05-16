var express = require('express');
var router = express.Router();
var http = require('http');
var propertiesReader = require('properties-reader');
var properties = propertiesReader('../config/config.ini');
var property = properties.get('dev.measure-platform.url');
var CronJob = require('cron').CronJob;

var measureInstances = ["randomInstance1", "RandomSumInstance1"];
// table : project | measure instance | measure


var job1 = new CronJob({
    cronTime: '*/1 * * * *',
    onTick: function() {
        console.log('job 1 ticked');
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


    },
    start: false
});

job1.start();