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
publisher.config("SET","notify-keyspace-events", "KEA");

var efsm = new mmt.EFSM(
    {
        id: "test_response_time",
        hascontext: true,
        logdata: true,
        onCreation: function () {},
        onDeletion: function () {},
        events: ['new_response_time', 'new_bandwith', 'timeout.to'],
        states: [
            {
                id: 'init'
            },
            {
                id: 'response_time1_received'
            },
            {
                id: 'response_time2_received'
            },
            {
                id: 'bandwith1_received'
            },
            {
                id: 'bandwith2_received'
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
                varname: 'response_time_old',
                startval: 0
            },
            {
                varname: 'response_time_new',
                startval: 0
            },
            {
                varname: 'bandwith_old',
                startval: 0
            },
            {
                varname: 'bandwith_new',
                startval: 0
            },
            {
                varname: 'threshold',
                startval: 50
            },
            {
                varname: 'recommendation_txt',
                startval: "check the last commit for problems in the code that generate a longer response time"
            }
        ],
        transitions: [
            {
                from: 'init',
                to: 'response_time1_received',
                event: 'new_response_time',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["response_time_old"].value = msg.data.value;
                        console.log("response_time_old : " + active_state.contextvariables["response_time_old"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'init',
                to: 'bandwith1_received',
                event: 'new_response_time',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["bandwith_old"].value = msg.data.value;
                        console.log("bandwith_old : " + active_state.contextvariables["bandwith_old"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'response_time1_received',
                to: 'response_time2_received',
                event: 'new_response_time',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["response_time_new"].value = msg.data.value;
                        console.log("response_time_old : " + active_state.contextvariables["response_time_old"].value);
                        console.log("response_time_new : " + active_state.contextvariables["response_time_new"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'bandwith1_received',
                to: 'bandwith2_received',
                event: 'new_bandwith',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["bandwith_old"].value = msg.data.value;
                        console.log("bandwith_old : " + active_state.contextvariables["bandwith_old"].value);
                        console.log("bandwith_new : " + active_state.contextvariables["bandwith_new"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'response_time1_received',
                to: 'bandwith1_received',
                event: 'new_bandwith',
                conditions: [{fct: function(active_state, evt, msg) {
                    console.log("bandwith_old : " + active_state.contextvariables["bandwith_old"].value);
                    return (active_state.contextvariables["bandwith_old"].value == 0);
                    }}],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["bandwith_old"].value = msg.data.value;
                        console.log("response_time_old : " + active_state.contextvariables["response_time_old"].value);
                        console.log("bandwith_old : " + active_state.contextvariables["bandwith_old"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'response_time1_received',
                to: 'bandwith2_received',
                event: 'new_bandwith',
                conditions: [{fct: function(active_state, evt, msg) {
                        return (active_state.contextvariables["bandwith_old"].value > 0);
                    }}],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["bandwith_new"].value = msg.data.value;
                        console.log("response_time_old : " + active_state.contextvariables["response_time_old"].value);
                        console.log("bandwith_old : " + active_state.contextvariables["bandwith_old"].value);
                        console.log("bandwith_new : " + active_state.contextvariables["bandwith_new"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'bandwith1_received',
                to: 'response_time1_received',
                event: 'new_response_time',
                conditions: [{fct: function(active_state, evt, msg) {
                        return (active_state.contextvariables["response_time_old"].value == 0);
                    }}],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["response_time_old"].value = msg.data.value;
                        console.log("response_time_old : " + active_state.contextvariables["response_time_old"].value);
                        console.log("bandwith_old : " + active_state.contextvariables["bandwith_old"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'bandwith1_received',
                to: 'response_time2_received',
                event: 'new_response_time',
                conditions: [{fct: function(active_state, evt, msg) {
                        return (active_state.contextvariables["response_time_old"].value > 0);
                    }}],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["response_time_new"].value = msg.data.value;
                        console.log("response_time_old : " + active_state.contextvariables["response_time_old"].value);
                        console.log("bandwith_old : " + active_state.contextvariables["bandwith_old"].value);
                        console.log("response_time_new : " + active_state.contextvariables["response_time_new"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'response_time2_received',
                to: 'recommendation',
                event: 'new_bandwith',
                conditions: [{fct: function(active_state, evt, msg) {
                        return (active_state.contextvariables["bandwith_old"].value > 0);
                    }}],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["bandwith_new"].value = msg.data.value;
                        console.log("response_time_old : " + active_state.contextvariables["response_time_old"].value);
                        console.log("response_time_new : " + active_state.contextvariables["response_time_new"].value);
                        console.log("bandwith_old : " + active_state.contextvariables["bandwith_old"].value);
                        console.log("bandwith_new : " + active_state.contextvariables["bandwith_new"].value);
                        publisher.publish('recommendations', active_state.contextvariables["recommendation_txt"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'bandwith2_received',
                to: 'recommendation',
                event: 'new_response_time',
                conditions: [{fct: function(active_state, evt, msg) {
                        return (active_state.contextvariables["response_time_old"].value > 0);
                    }}],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["response_time_new"].value = msg.data.value;
                        console.log("response_time_old : " + active_state.contextvariables["response_time_old"].value);
                        console.log("response_time_new : " + active_state.contextvariables["response_time_new"].value);
                        console.log("bandwith_old : " + active_state.contextvariables["bandwith_old"].value);
                        console.log("bandwith_new : " + active_state.contextvariables["bandwith_new"].value);
                        publisher.publish('recommendations', active_state.contextvariables["recommendation_txt"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            // TODO response_time1 a recommendation, bandwith1 a recommendation
        ]
    }
);
