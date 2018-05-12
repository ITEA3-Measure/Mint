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
        id: "test_modular_design",
        hascontext: true,
        logdata: true,
        onCreation: function () {},
        onDeletion: function () {},
        events: ['new_maintainability_rating', 'new_class_complexity', 'timeout.to'],
        states: [
            {
                id: 'init'
            },
            {
                id: 'maintainability_rating_received'
            },
            {
                id: 'class_complexity_received'
            },
            {
                id: 'recommendation',
                // function send recommendation
                onStepIn: function() {},
                onStepOut: function() {},
            }
        ],
        // Context variables of the machine
        contextvars: [
            {
                varname: 'class_complexity',
                startval: 0
            },
            {
                varname: 'maintainability_rating',
                startval: 0
            },
            {
                varname: 'quotient',
                startval: 0
            },
            {
                varname: 'threshold',
                startval: 50
            },
            {
                varname: 'recommendation_txt',
                startval: "Reforce the modular design of your development to allow more extensible, reusable, maintainable, and adaptable code"
            }
        ],
        transitions: [
            {
                from: 'init',
                to: 'maintainability_rating_received',
                event: 'new_maintainability_rating',
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["maintainability_rating"].value = msg.data.value;
                        console.log("maintainability_rating : " + active_state.contextvariables["maintainability_rating"].value);
                        console.log("class_complexity : " + active_state.contextvariables["class_complexity"].value);
                }
                },
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'init',
                to: 'class_complexity_received',
                event: 'new_class_complexity',
                // conditions: [{fct: function() {return true}}],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["class_complexity"].value = msg.data.value;
                        console.log("maintainability_rating : " + active_state.contextvariables["maintainability_rating"].value);
                        console.log("class_complexity : " + active_state.contextvariables["class_complexity"].value)}
                },
                    {fct: mmt.startTimer, opts: {timeout: 10000, name: 'to'}}]
            },
            {
                from: 'maintainability_rating_received',
                to: 'recommendation',
                event: 'new_class_complexity',
                conditions: [{fct: function(active_state, evt, msg) {
                        active_state.contextvariables["class_complexity"].value = msg.data.value;
                        console.log("maintainability_rating : " + active_state.contextvariables["maintainability_rating"].value);
                        console.log("class_complexity : " + active_state.contextvariables["class_complexity"].value);
                        if(active_state.contextvariables["class_complexity"].value > 0 && active_state.contextvariables["maintainability_rating"].value > 0) {
                            active_state.contextvariables["quotient"].value = active_state.contextvariables["class_complexity"].value/active_state.contextvariables["maintainability_rating"].value;
                        }
                        return (active_state.contextvariables["quotient"].value > active_state.contextvariables["threshold"].value)}}
                ],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        console.log(msg.data.id + " : " + msg.data.value + " quotient : " + active_state.contextvariables["quotient"].value)
                        publisher.publish('recommendations', active_state.contextvariables["recommendation_txt"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 2000, name: 'to'}}]
            },
            {
                from: 'class_complexity_received',
                to: 'recommendation',
                event: 'new_maintainability_rating',
                conditions: [{fct: function(active_state, evt, msg) {
                        active_state.contextvariables["maintainability_rating"].value = msg.data.value;
                        console.log("maintainability_rating : " + active_state.contextvariables["maintainability_rating"].value);
                        console.log("class_complexity : " + active_state.contextvariables["class_complexity"].value);
                        if(active_state.contextvariables["class_complexity"].value > 0 && active_state.contextvariables["maintainability_rating"].value > 0) {
                            active_state.contextvariables["quotient"].value = active_state.contextvariables["class_complexity"].value/active_state.contextvariables["maintainability_rating"].value;
                        }
                        return (active_state.contextvariables["quotient"].value > active_state.contextvariables["threshold"].value)}}
                ],
                actions: [{fct: function (active_state, evt, msg){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        console.log(msg.data.id + " : " + msg.data.value + " quotient : " + active_state.contextvariables["quotient"].value)
                        publisher.publish('recommendations', active_state.contextvariables["recommendation_txt"].value);
                    }},
                    {fct: mmt.startTimer, opts: {timeout: 2000, name: 'to'}}]
            },
            // if the input is a new class_complexity the value is updated
            {
                from: 'class_complexity_received',
                to: 'class_complexity_received',
                event: 'new_class_complexity',
                conditions: [],
                actions: [{fct: function(active_state, evt, msg) {
                        active_state.contextvariables["class_complexity"].value = msg.data.value;
                    }}]
            },
            // if the input is a new maintainability_rating the value is updated
            {
                from: 'maintainability_rating_received',
                to: 'maintainability_rating_received',
                event: 'new_maintainability_rating',
                conditions: [],
                actions: [{fct: function(active_state, evt, msg) {
                        active_state.contextvariables["maintainability_rating"].value = msg.data.value;
                    }}]
            },
            {
                from: 'maintainability_rating_received',
                to: 'init',
                event: 'timeout.to',
                conditions: [],
                actions: []
            },
            {
                from: 'class_complexity_received',
                to: 'init',
                event: 'timeout.to',
                conditions: [],
                actions: []
            },
            {
                from: 'recommendation',
                to: 'init',
                event: 'timeout.to',
                actions: [{fct: function (active_state, evt){
                        console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                        console.log(evt);
                        active_state.contextvariables["maintainability_rating"].value = 0;
                        active_state.contextvariables["number_issues"].value = 0;
                        console.log("maintainability_rating : " + active_state.contextvariables["maintainability_rating"].value);
                        console.log("class_complexity : " + active_state.contextvariables["class_complexity"].value);
                    }},
                    {fct: mmt.wipeLog}]
            }
        ]
    }
);
