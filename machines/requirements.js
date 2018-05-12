// mmt-modified
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
publisher.config("SET","notify-keyspace-events", "KEA");

var efsm = new mmt.EFSM(
    {
        id: "test_requirements",
        hascontext: true,
        logdata: true,
        onCreation: function () {},
        onDeletion: function () {},
        events: ['new_number_issues', 'new_number_reopen_issues', 'timeout.to'],
        states: [
            {
                id: 'init'
            },
            {
                id: 'number_issues_received'
            },
            {
                id: 'number_reopen_issues_received'
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
                varname: 'number_issues',
                startval: 0
            },
            {
                varname: 'number_reopen_issues',
                startval: 0
            },
            {
                varname: 'quotient',
                startval: 0
            },
            {
                varname: 'threshold',
                startval: 5
            },
            {
                varname: 'recommendation_txt',
                startval: {
                    analysisId: 107,
                    description : ""
                }
            }
        ],
        transitions: [
            {
                from: 'init',
                to: 'number_issues_received',
                event: 'new_number_issues',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["number_issues"].value = msg.data.value;
                        console.log("number_issues : " + active_state.contextvariables["number_issues"].value);
                        console.log("number_reopen_issues : " + active_state.contextvariables["number_reopen_issues"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 5000, name: 'to'}}]
            },
            {
                from: 'init',
                to: 'number_reopen_issues_received',
                event: 'new_number_reopen_issues',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["number_reopen_issues"].value = msg.data.value;
                        console.log("number_issues : " + active_state.contextvariables["number_issues"].value);
                        console.log("number_reopen_issues : " + active_state.contextvariables["number_reopen_issues"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 5000, name: 'to'}}]
            },
            {
                from: 'number_issues_received',
                to: 'number_issues_received',
                event: 'new_number_issues',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["number_issues"].value = msg.data.value;
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 5000, name: 'to'}}]
            },
            {
                from: 'number_reopen_issues_received',
                to: 'number_reopen_issues_received',
                event: 'new_number_reopen_issues',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["number_reopen_issues"].value = msg.data.value;
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 5000, name: 'to'}}]
            },
            {
                from: 'number_reopen_issues_received',
                to: 'recommendation',
                event: 'new_number_issues',
                conditions: [{fct: function(active_state, evt, msg) {
                        active_state.contextvariables["number_issues"].value = msg.data.value;
                        if(active_state.contextvariables["number_issues"].value > 0 && active_state.contextvariables["number_reopen_issues"].value > 0) {
                            active_state.contextvariables["quotient"].value = (active_state.contextvariables["number_reopen_issues"].value * 100)/active_state.contextvariables["number_issues"].value;
                        }
                        return (active_state.contextvariables["quotient"].value > active_state.contextvariables["threshold"].value)}}
                ],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        console.log("number_issues : " + active_state.contextvariables["number_issues"].value);
                        console.log("number_reopen_issues : " + active_state.contextvariables["number_reopen_issues"].value);
                        console.log(active_state.contextvariables["recommendation_txt"].value);
                        publisher.publish('recommendations', JSON.stringify(active_state.contextvariables["recommendation_txt"].value));
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 2000, name: 'to'}}]
            },
            {
                from: 'number_issues_received',
                to: 'recommendation',
                event: 'new_number_reopen_issues',
                conditions: [{fct: function(active_state, evt, msg) {
                        active_state.contextvariables["number_reopen_issues"].value = msg.data.value;
                        if(active_state.contextvariables["number_issues"].value > 0 && active_state.contextvariables["number_reopen_issues"].value > 0) {
                            active_state.contextvariables["quotient"].value = (active_state.contextvariables["number_reopen_issues"].value * 100)/active_state.contextvariables["number_issues"].value;
                        }
                        return (active_state.contextvariables["quotient"].value > active_state.contextvariables["threshold"].value)}}
                ],
                actions: [{fct: function (active_state, evt){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        console.log("number_issues : " + active_state.contextvariables["number_issues"].value);
                        console.log("number_reopen_issues : " + active_state.contextvariables["number_reopen_issues"].value);
                        console.log(active_state.contextvariables["recommendation_txt"].value);
                        publisher.publish('recommendations', JSON.stringify(active_state.contextvariables["recommendation_txt"].value));
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 2000, name: 'to'}}]
            },
            {
                from: 'number_reopen_issues_received',
                to: 'init',
                event: 'timeout.to',
                actions: [{fct: function (active_state, evt){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["number_reopen_issues"].value = 0;
                    }},
                    {fct: mmt.wipeLog}]
            },
            {
                from: 'number_issues_received',
                to: 'init',
                event: 'timeout.to',
                actions: [{fct: function (active_state, evt){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["number_issues"].value = 0;
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
                        active_state.contextvariables["number_reopen_issues"].value = 0;
                        active_state.contextvariables["number_issues"].value = 0;
                        console.log("number_issues : " + active_state.contextvariables["number_issues"].value);
                        console.log("number_reopen_issues : " + active_state.contextvariables["number_reopen_issues"].value);
                    }},
                    {fct: mmt.wipeLog}]
            },
            {
                from: 'init',
                to: 'init',
                event: 'timeout.to',
                actions: []
            }
        ]
    }
);
/*
var time = 1000;

var ni = 100;
var nri = 3;


setInterval(function(){ console.log("- tick " + time/1000); time += 1000; publisher.publish('tick', JSON.stringify(MMT.tickJSON(time)))}, 1000);

// Percentage of reopen issues is 3%, no recommendation
setTimeout(function(){ ni = 100; publisher.publish('new_number_issues', JSON.stringify(MMT.attributeJSON(time, 'ni', ni, [], 'i1'))); console.log("time "+time+" ni "+ni);}, 8000);
setTimeout(function(){ nri = 20; publisher.publish('new_number_reopen_issues', JSON.stringify(MMT.attributeJSON(time, 'nri', nri, [], 'i1'))); console.log("time "+time+" nri "+nri);}, 9000);
*/

