var config = require('../config/config');
var efsm;
EFSM = {
    create: function(options) {
        console.log(options['analysisId']);
        var mmt = options['mmt'];
        var publisher = options['publisher'];
        var threshold = options['threshold'];
        var analysisId = options['analysisId'];

        efsm = new mmt.EFSM(
            {
                id: "test_modular_design",
                hascontext: true,
                logdata: true,
                onCreation: function () {},
                onDeletion: function () {},
                events: ['new_MaintainabilityRatingBySonarCube', 'new_ClassComplexityBySonarCube', 'timeout.to'],
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
                        startval: threshold
                    },
                    {
                        varname: 'recommendation_txt',
                        startval: {
                            analysisId: analysisId,
                            description : ""
                        }
                    }
                ],
                transitions: [
                    {
                        from: 'init',
                        to: 'maintainability_rating_received',
                        event: 'new_MaintainabilityRatingBySonarCube',
                        actions: [{fct: function (active_state, evt, msg){
                                console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                                console.log(evt);
                                active_state.contextvariables["maintainability_rating"].value = msg.data.value;
                                console.log("maintainability_rating : " + active_state.contextvariables["maintainability_rating"].value);
                                console.log("class_complexity : " + active_state.contextvariables["class_complexity"].value);
                        }
                        },
                            {fct: mmt.startTimer, opts: {timeout: config.app.machineTimeout, name: 'to'}}]
                    },
                    {
                        from: 'init',
                        to: 'class_complexity_received',
                        event: 'new_ClassComplexityBySonarCube',
                        // conditions: [{fct: function() {return true}}],
                        actions: [{fct: function (active_state, evt, msg){
                                console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                                console.log(evt);
                                active_state.contextvariables["class_complexity"].value = msg.data.value;
                                console.log("maintainability_rating : " + active_state.contextvariables["maintainability_rating"].value);
                                console.log("class_complexity : " + active_state.contextvariables["class_complexity"].value)}
                        },
                            {fct: mmt.startTimer, opts: {timeout: config.app.machineTimeout, name: 'to'}}]
                    },
                    {
                        from: 'maintainability_rating_received',
                        to: 'recommendation',
                        event: 'new_ClassComplexityBySonarCube',
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
                                // edit detail message
                                var msg = active_state.contextvariables["recommendation_txt"].value;
                                msg.description = "class_complexity : " + active_state.contextvariables["class_complexity"].value
                                    + " maintainability_rating : " + active_state.contextvariables["maintainability_rating"].value
                                    + " threshold : " + active_state.contextvariables["threshold"].value;
                                publisher.publish('recommendations', JSON.stringify(msg));
                            }},
                            {fct: mmt.startTimer, opts: {timeout: 1000, name: 'to'}}]
                    },
                    {
                        from: 'class_complexity_received',
                        to: 'recommendation',
                        event: 'new_MaintainabilityRatingBySonarCube',
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
                                // edit detail message
                                var msg = active_state.contextvariables["recommendation_txt"].value;
                                msg.description = "class_complexity : " + active_state.contextvariables["class_complexity"].value
                                    + " maintainability_rating : " + active_state.contextvariables["maintainability_rating"].value
                                    + " threshold : " + active_state.contextvariables["threshold"].value;
                                publisher.publish('recommendations', JSON.stringify(msg));
                            }},
                            {fct: mmt.startTimer, opts: {timeout: 1000, name: 'to'}}]
                    },
                    // if the input is a new class_complexity the value is updated
                    {
                        from: 'class_complexity_received',
                        to: 'class_complexity_received',
                        event: 'new_ClassComplexityBySonarCube',
                        conditions: [],
                        actions: [{fct: function(active_state, evt, msg) {
                                active_state.contextvariables["class_complexity"].value = msg.data.value;
                            }}]
                    },
                    // if the input is a new maintainability_rating the value is updated
                    {
                        from: 'maintainability_rating_received',
                        to: 'maintainability_rating_received',
                        event: 'new_MaintainabilityRatingBySonarCube',
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
        return efsm;
    },
};
module.exports = EFSM;