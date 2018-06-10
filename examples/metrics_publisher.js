var redis = require("redis");
var util = require("util");
var mmt = require('../utils/mmt-correlator/src/efsm');
const readline = require('readline');

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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var time = 1000;
setInterval(function(){ publisher.set('tick', JSON.stringify(MMT.tickJSON(time))); time += 1000}, 1000);

/*
* Requirements
* */
// Percentage of reopen issues is 3%, no recommendation
setTimeout(function(){ var ni = 100; publisher.publish('new_number_issues', JSON.stringify(MMT.attributeJSON(time, 'ni', ni, [], 'i1'))); console.log("time "+time+" ni "+ni);}, 3000);
setTimeout(function(){ var nri = 3; publisher.publish('new_number_reopen_issues', JSON.stringify(MMT.attributeJSON(time, 'nri', nri, [], 'i1'))); console.log("time "+time+" nri "+nri);}, 4000);

// Percentage of reopen issues is 50%, recommendation
setTimeout(function(){ var ni = 100; publisher.publish('new_number_issues', JSON.stringify(MMT.attributeJSON(time, 'ni', ni, [], 'i1'))); console.log("time "+time+" ni "+ni);}, 6000);
setTimeout(function(){ var nri = 50; publisher.publish('new_number_reopen_issues', JSON.stringify(MMT.attributeJSON(time, 'nri', nri, [], 'i1'))); console.log("time "+time+" nri "+nri);}, 7000);

/*
* Modularity
* */
//
setTimeout(function(){ var mr = 1; publisher.publish('new_maintainability_rating', JSON.stringify(MMT.attributeJSON(time, 'mr', mr, [], 'i1'))); }, 8000);
setTimeout(function(){ var cc = 100; publisher.publish('new_class_complexity', JSON.stringify(MMT.attributeJSON(time, 'cc', cc, [], 'i1'))); }, 9000);

/*
* Vulnerabilities
* */
// sr = A y si = 1
setTimeout(function(){ sr = "A"; publisher.publish('new_security_rating', JSON.stringify(MMT.attributeJSON(time, 'sr', sr, [], 'i1'))); console.log("time "+time+" sr "+sr);}, 10000);
setTimeout(function(){ si = 1; publisher.publish('new_security_incidents', JSON.stringify(MMT.attributeJSON(time, 'si', si, [], 'i1'))); console.log("time "+time+" si "+si);}, 11000);

// sr = C y si = 10
setTimeout(function(){sr = "C"; publisher.publish('new_security_rating', JSON.stringify(MMT.attributeJSON(time, 'sr', sr, [], 'i1'))); console.log("time "+time+" sr "+sr);}, 12000);
setTimeout(function(){si = 10; publisher.publish('new_security_incidents', JSON.stringify(MMT.attributeJSON(time, 'si', si, [], 'i1'))); console.log("time "+time+" si "+si);}, 13000);

/*
* Code Quality
* */
// Reliability rating is E and issues by severity major => recommendation
setTimeout(function(){ ibs = "major"; publisher.publish('new_issues_by_severity', JSON.stringify(MMT.attributeJSON(time, 'ibs', ibs, [], 'i1'))); console.log("time "+time+" ibs "+ibs);}, 14000);
setTimeout(function(){ rr = "E"; publisher.publish('new_reliability_rating', JSON.stringify(MMT.attributeJSON(time, 'rr', rr, [], 'i1'))); console.log("time "+time+" rr "+rr);}, 15000);

// Reliability rating is A and issues by severity minor => no recommendation
setTimeout(function(){ibs = "minor"; publisher.publish('new_issues_by_severity', JSON.stringify(MMT.attributeJSON(time, 'ibs', ibs, [], 'i1'))); console.log("time "+time+" ibs "+ibs);}, 16000);
setTimeout(function(){rr = "A"; publisher.publish('new_reliability_rating', JSON.stringify(MMT.attributeJSON(time, 'rr', rr, [], 'i1'))); console.log("time "+time+" rr "+rr);}, 17000);

/*
* Performance
* */
// new_response_time = 100, new_bandwith = 100, new_response_time = 200, new_bandwith = 100
setTimeout(function(){rt = "100"; publisher.publish('new_response_time', JSON.stringify(MMT.attributeJSON(time, 'rt', rt, [], 'i1'))); console.log("time "+time+" rt "+rt);}, 18000);
setTimeout(function(){bw = "100"; publisher.publish('new_bandwith', JSON.stringify(MMT.attributeJSON(time, 'bw', bw, [], 'i1'))); console.log("time "+time+" bw "+bw);}, 19000);
setTimeout(function(){rt = "200"; publisher.publish('new_response_time', JSON.stringify(MMT.attributeJSON(time, 'rt', rt, [], 'i1'))); console.log("time "+time+" rt "+rt);}, 20000);
setTimeout(function(){bw = "100"; publisher.publish('new_bandwith', JSON.stringify(MMT.attributeJSON(time, 'bw', bw, [], 'i1'))); console.log("time "+time+" bw "+bw);}, 21000);
