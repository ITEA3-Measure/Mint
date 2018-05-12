// mmt-modified
// var mmt = require('../../../mmt-correlator-DIEGO/mmt-modified/src/efsm');
var redis = require("redis");
var util = require("util");

var settings = {
    eventbus: {
        type: 'redis',
        host: '127.0.0.1',
        port: 6379
    }
};

var publisher = redis.createClient(settings.eventbus.port, settings.eventbus.host);

var time = 1000;
setInterval(function(){ publisher.publish('tick', JSON.stringify(MMT.tickJSON(time))); time += 1000}, 1000);

setTimeout(function () {publisher.publish('recommendations', "recommendation time"+time)}, 1000);
setTimeout(function () {publisher.publish('recommendations', "recommendation time"+time)}, 3000);
setTimeout(function () {publisher.publish('recommendations', "recommendation time"+time)}, 5000);
setTimeout(function () {publisher.publish('recommendations', "recommendation time"+time)}, 7000);
