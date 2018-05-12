/*
* Cron consult active machines and activate them
* Cron that consult for new metric values and put them in the redis bus
* */

var express = require('express');
var router = express.Router();
var http = require('http');
var propertiesReader = require('properties-reader');
//var properties = propertiesReader('../config/config.ini');
//var property = properties.get('dev.measure-platform.url');
var CronJob = require('cron').CronJob;/*
var models  = require('../models');
var machines = requiere('../machines');*/

var activateMachine = new CronJob({
    cronTime: '*/1 * * * * *',
    onTick: function() {
        console.log('job 2 ticked');
    },
    start: false
});

var mmt = require('../utils/mmt-correlator/src/efsm');
var redis = require("redis");
var util = require("util");

var settings = {
    eventbus: {
        type: 'redis',
        host: '127.0.0.1',
        port: 6379
    }
};

mmt.init(settings);
var publisher = redis.createClient(settings.eventbus.port, settings.eventbus.host);


var m = require('../machines/codeQuality');
var mach = new CodeQuality(publisher, 1, 1);