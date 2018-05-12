// mmt-modified
var mmt = require('../../../mmt-correlator-DIEGO/mmt-modified/src/efsm');
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

var efsm = new mmt.EFSM(
    {
        id: "test_security",
        hascontext: true,
        logdata: true,
        onCreation: function () {},
        onDeletion: function () {},
        events: ['new_security_rating', 'new_security_incidents', 'timeout.to'],
        states: [
            {
                id: 'init'
            },
            {
                id: 'security_rating_received'
            },
            {
                id: 'security_incidents_received'
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
                varname: 'security_rating',
                startval: 0
            },
            {
                varname: 'security_incidents',
                startval: 0
            },
            {
                varname: 'threshold',
                startval: 50
            },
            {
                varname: 'recommendation_txt',
                startval: "Check code for vulnerabilities like error handling or input validation"
            }
        ],
        transitions: [
            {
                from: 'init',
                to: 'security_rating_received',
                event: 'new_security_rating',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["security_rating"].value = msg.data.value;
                        console.log("security_rating : " + active_state.contextvariables["security_rating"].value);
                        console.log("security_incidents : " + active_state.contextvariables["security_incidents"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'init',
                to: 'security_incidents_received',
                event: 'new_security_incidents',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["security_incidents"].value = msg.data.value;
                        console.log("security_rating : " + active_state.contextvariables["security_rating"].value);
                        console.log("security_incidents : " + active_state.contextvariables["security_incidents"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'security_rating_received',
                to: 'security_rating_received',
                event: 'new_security_rating',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["security_rating"].value = msg.data.value;
                        console.log("security_rating : " + active_state.contextvariables["security_rating"].value);
                        console.log("security_incidents : " + active_state.contextvariables["security_incidents"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'security_incidents_received',
                to: 'security_incidents_received',
                event: 'new_security_incidents',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["security_incidents"].value = msg.data.value;
                        console.log("security_rating : " + active_state.contextvariables["security_rating"].value);
                        console.log("security_incidents : " + active_state.contextvariables["security_incidents"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'security_rating_received',
                to: 'recommendation',
                event: 'new_security_incidents',
                conditions: [{fct: function(active_state, evt, msg) {
                        active_state.contextvariables["security_incidents"].value = msg.data.value;
                        var security_rating = active_state.contextvariables["security_rating"].value;
                        var security_incidents = active_state.contextvariables["security_incidents"].value;
                        var max_incidents = 3;
                        return (security_rating >= "C" && security_incidents >= max_incidents);
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
                from: 'security_incidents_received',
                to: 'recommendation',
                event: 'new_security_rating',
                conditions: [{fct: function(active_state, evt, msg) {
                        active_state.contextvariables["security_rating"].value = msg.data.value;
                        var security_rating = active_state.contextvariables["security_rating"].value;
                        var security_incidents = active_state.contextvariables["security_incidents"].value;
                        var max_incidents = 3;
                        return (security_rating >= "C" && security_incidents >= max_incidents);
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
                from: 'security_rating_received',
                to: 'init',
                event: 'timeout.to',
                actions: [{fct: function (active_state, evt){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["security_rating"].value = 0;
                        active_state.contextvariables["security_incidents"].value = 0;
                    }},
                    {fct: mmt.wipeLog}]
            },
            {
                from: 'security_rating_received',
                to: 'init',
                event: 'new_security_incidents',
                conditions: [{fct: function(active_state, evt, msg) {
                        active_state.contextvariables["security_incidents"].value = msg.data.value;
                        var security_rating = active_state.contextvariables["security_rating"].value;
                        var security_incidents = active_state.contextvariables["security_incidents"].value;
                        var max_incidents = 3;
                        return !(security_rating > "C" && security_incidents >= max_incidents);
                    }}
                ],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                    }},
                    {fct: mmt.wipeLog}]
            },
            {
                from: 'security_incidents_received',
                to: 'init',
                event: 'timeout.to',
                actions: [{fct: function (active_state, evt){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["security_rating"].value = 0;
                        active_state.contextvariables["security_incidents"].value = 0;
                    }},
                    {fct: mmt.wipeLog}]
            },
            {
                from: 'security_rating_received',
                to: 'init',
                event: 'new_security_incidents',
                conditions: [{fct: function(active_state, evt, msg) {
                        active_state.contextvariables["security_rating"].value = msg.data.value;
                        var security_rating = active_state.contextvariables["security_rating"].value;
                        var security_incidents = active_state.contextvariables["security_incidents"].value;
                        var max_incidents = 3;
                        return !(security_rating > "C" && security_incidents >= max_incidents);
                    }}
                ],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
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
                        active_state.contextvariables["security_incidents"].value = 0;
                        active_state.contextvariables["security_rating"].value = 0;
                        console.log("security_incidents : " + active_state.contextvariables["security_incidents"].value);
                        console.log("security_rating : " + active_state.contextvariables["security_rating"].value);
                    }},
                    {fct: mmt.wipeLog}]
            }
        ]
    }
);