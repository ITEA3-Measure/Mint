// mmt-modified
var mmt = require('../utils/mmt-correlator/src/efsm');
var redis = require("redis");
var util = require("util");

var threshold;
var projectId;
var machineId;

var settings = {
    eventbus: {
        type: 'redis',
        host: '127.0.0.1',
        port: 6379
    }
};

var message = {
  projectId : projectId,
  mechineId : machineId
};
mmt.init(settings);
var publisher = redis.createClient(settings.eventbus.port, settings.eventbus.host);

function CodeQuality(publisher, threshold, projectId) {
    console.log("asdasdasdasd");
}


module.exports = CodeQuality;


var efsm = new mmt.EFSM(
    {
        id: "test_code_review",
        hascontext: true,
        logdata: true,
        onCreation: function () {},
        onDeletion: function () {},
        events: ['new_issues_by_severity', 'new_reliability_rating', 'new_uncovered_conditions', 'timeout.to'],
        states: [
            {
                id: 'init'
            },
            {
                id: 'issues_by_severity_received'
            },
            {
                id: 'reliability_rating_received'
            },
            {
                id: 'uncovered_conditions_received'
            },
            {
                id: 'recommendation',
                // function send recommendation
                onStepIn: function() {},
                onStepOut: function() {},
            },
            {
                id: 'timeout'
            }
        ],
        // Context variables of the machine
        contextvars: [
            {
                varname: 'issues_by_severity',
                startval: 0
            },
            {
                varname: 'reliability_rating',
                startval: 0
            },
            {
                varname: 'uncovered_conditions',
                startval: 0
            },
            {
                varname: 'threshold',
                startval: 50
            },
            {
                varname: 'recommendation_txt',
                startval: ""
            }
        ],
        transitions: [
            {
                from: 'init',
                to: 'issues_by_severity_received',
                event: 'new_issues_by_severity',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["issues_by_severity"].value = msg.data.value;
                        console.log("issues_by_severity : " + active_state.contextvariables["issues_by_severity"].value);
                        console.log("reliability_rating : " + active_state.contextvariables["reliability_rating"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'init',
                to: 'reliability_rating_received',
                event: 'new_reliability_rating',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["reliability_rating"].value = msg.data.value;
                        console.log("issues_by_severity : " + active_state.contextvariables["issues_by_severity"].value);
                        console.log("reliability_rating : " + active_state.contextvariables["reliability_rating"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'issues_by_severity_received',
                to: 'issues_by_severity_received',
                event: 'new_issues_by_severity',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["issues_by_severity"].value = msg.data.value;
                        console.log("issues_by_severity : " + active_state.contextvariables["issues_by_severity"].value);
                        console.log("reliability_rating : " + active_state.contextvariables["reliability_rating"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'reliability_rating_received',
                to: 'reliability_rating_received',
                event: 'new_reliability_rating',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["reliability_rating"].value = msg.data.value;
                        console.log("issues_by_severity : " + active_state.contextvariables["issues_by_severity"].value);
                        console.log("reliability_rating : " + active_state.contextvariables["reliability_rating"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'issues_by_severity_received',
                to: 'recommendation',
                event: 'new_reliability_rating',
                conditions: [{fct: function(active_state, evt, msg) {
                        active_state.contextvariables["reliability_rating"].value = msg.data.value;
                        var issues_by_severity = active_state.contextvariables["issues_by_severity"].value;
                        var reliability_rating = active_state.contextvariables["reliability_rating"].value;
                        if ((issues_by_severity == "major" || issues_by_severity == "critical") && reliability_rating >= "E") {
                            active_state.contextvariables["recommendation_txt"].value = "Critical code review";
                            return true;
                        }
                        if ((issues_by_severity == "minor") && (reliability_rating < "E")) {
                            active_state.contextvariables["recommendation_txt"].value = "More unit tests";
                            return true;
                        }
                        return false;
                    }}
                ],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        console.log(active_state.contextvariables["recommendation_txt"].value);
                        publisher.publish('recommendations', active_state.contextvariables["recommendation_txt"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 1000, name: 'to'}}]
            },
            {
                from: 'reliability_rating_received',
                to: 'recommendation',
                event: 'new_issues_by_severity',
                conditions: [{fct: function(active_state, evt, msg) {
                        active_state.contextvariables["issues_by_severity"].value = msg.data.value;
                        var issues_by_severity = active_state.contextvariables["issues_by_severity"].value;
                        var reliability_rating = active_state.contextvariables["reliability_rating"].value;
                        if ((issues_by_severity == "major" || issues_by_severity == "critical") && reliability_rating >= "E") {
                            active_state.contextvariables["recommendation_txt"].value = "Critical code review";
                            return true;
                        }
                        if ((issues_by_severity == "minor") && (reliability_rating < "E")) {
                            active_state.contextvariables["recommendation_txt"].value = "More unit tests";
                            return true;
                        }
                        return false;
                    }}
                ],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        console.log(active_state.contextvariables["recommendation_txt"].value);
                        publisher.publish('recommendations', active_state.contextvariables["recommendation_txt"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 1000, name: 'to'}}]
            },
            {
                from: 'issues_by_severity_received',
                to: 'init',
                event: 'timeout.to',
                actions: [{fct: function (active_state, evt){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["issues_by_severity"].value = 0;
                    }},
                    {fct: mmt.wipeLog}]
            },
            {
                from: 'reliability_rating_received',
                to: 'init',
                event: 'timeout.to',
                actions: [{fct: function (active_state, evt){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["reliability_rating"].value = 0;
                    }},
                    {fct: mmt.wipeLog}]
            },
            {
                from: 'recommendation',
                to: 'init',
                event: 'timeout.to',
                actions: [{fct: function (active_state, evt){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["reliability_rating"].value = 0;
                        active_state.contextvariables["issues_by_severity"].value = 0;
                        console.log("reliability_rating : " + active_state.contextvariables["reliability_rating"].value);
                        console.log("issues_by_severity : " + active_state.contextvariables["issues_by_severity"].value);
                    }},
                    {fct: mmt.wipeLog}]
            }
        ]
    }
);
/*

var time = 1000;

setInterval(function(){ console.log("- tick " + time/1000); time += 1000; publisher.publish('tick', JSON.stringify(MMT.tickJSON(time)))}, 1000);

var issues_by_severity = "";
var reliability_rating = "";
// Percentage of reopen issues is 3%, no recommendation
setTimeout(function(){ issues_by_severity = "major"; publisher.publish('new_issues_by_severity', JSON.stringify(MMT.attributeJSON(time, 'issues_by_severity', issues_by_severity, [], 'i1'))); console.log("time "+time+" issues_by_severity "+issues_by_severity);}, 2000);
setTimeout(function(){ reliability_rating = "E"; publisher.publish('new_reliability_rating', JSON.stringify(MMT.attributeJSON(time, 'reliability_rating', reliability_rating, [], 'i1'))); console.log("time "+time+" reliability_rating "+reliability_rating);}, 3000);

// Percentage of reopen issues is 10%, make recommendation
setTimeout(function(){issues_by_severity = "minor"; publisher.publish('new_issues_by_severity', JSON.stringify(MMT.attributeJSON(time, 'issues_by_severity', issues_by_severity, [], 'i1'))); console.log("time "+time+" issues_by_severity "+issues_by_severity);}, 5000);
setTimeout(function(){reliability_rating = "A"; publisher.publish('new_reliability_rating', JSON.stringify(MMT.attributeJSON(time, 'reliability_rating', reliability_rating, [], 'i1'))); console.log("time "+time+" reliability_rating "+reliability_rating);}, 6000);
*/
