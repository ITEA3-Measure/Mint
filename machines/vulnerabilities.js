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
                id: "vulnerabilities",
                hascontext: true,
                logdata: true,
                onCreation: function () {},
                onDeletion: function () {},
                events: ['new_SecurityRatingBySonarCube_'+analysisId, 'new_MMT-SecurityIncidents_'+analysisId, 'timeout.to'],
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
                        to: 'security_rating_received',
                        event: 'new_SecurityRatingBySonarCube_'+analysisId,
                        actions: [{fct: function (active_state, evt, msg){
                                console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                                console.log(evt);
                                active_state.contextvariables["security_rating"].value = msg.data.value;
                                console.log("security_rating : " + active_state.contextvariables["security_rating"].value);
                                console.log("security_incidents : " + active_state.contextvariables["security_incidents"].value);
                            }},
                            {fct: mmt.startTimer, opts: {timeout: config.app.machineTimeout, name: 'to'}}]
                    },
                    {
                        from: 'init',
                        to: 'security_incidents_received',
                        event: 'new_MMT-SecurityIncidents_'+analysisId,
                        actions: [{fct: function (active_state, evt, msg){
                                console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                                console.log(evt);
                                active_state.contextvariables["security_incidents"].value = msg.data.value;
                                console.log("security_rating : " + active_state.contextvariables["security_rating"].value);
                                console.log("security_incidents : " + active_state.contextvariables["security_incidents"].value);
                            }},
                            {fct: mmt.startTimer, opts: {timeout: config.app.machineTimeout, name: 'to'}}]
                    },
                    {
                        from: 'security_rating_received',
                        to: 'security_rating_received',
                        event: 'new_SecurityRatingBySonarCube_'+analysisId,
                        actions: [{fct: function (active_state, evt, msg){
                                console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                                console.log(evt);
                                active_state.contextvariables["security_rating"].value = msg.data.value;
                                console.log("security_rating : " + active_state.contextvariables["security_rating"].value);
                                console.log("security_incidents : " + active_state.contextvariables["security_incidents"].value);
                            }},
                            {fct: mmt.startTimer, opts: {timeout: config.app.machineTimeout, name: 'to'}}]
                    },
                    {
                        from: 'security_incidents_received',
                        to: 'security_incidents_received',
                        event: 'new_MMT-SecurityIncidents_'+analysisId,
                        actions: [{fct: function (active_state, evt, msg){
                                console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                                console.log(evt);
                                active_state.contextvariables["security_incidents"].value = msg.data.value;
                                console.log("security_rating : " + active_state.contextvariables["security_rating"].value);
                                console.log("security_incidents : " + active_state.contextvariables["security_incidents"].value);
                            }},
                            {fct: mmt.startTimer, opts: {timeout: config.app.machineTimeout, name: 'to'}}]
                    },
                    {
                        from: 'security_rating_received',
                        to: 'recommendation',
                        event: 'new_MMT-SecurityIncidents_'+analysisId,
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
                                // edit detail message
                                var msg = active_state.contextvariables["recommendation_txt"].value;
                                msg.description = "security_rating : " + active_state.contextvariables["security_rating"].value
                                    + " security_incidents : " + active_state.contextvariables["security_incidents"].value;
                                publisher.publish('recommendations', JSON.stringify(msg));
                            }},
                            {fct: mmt.startTimer, opts: {timeout: 1000, name: 'to'}}]
                    },
                    {
                        from: 'security_incidents_received',
                        to: 'recommendation',
                        event: 'new_SecurityRatingBySonarCube_'+analysisId,
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
                                // edit detail message
                                var msg = active_state.contextvariables["recommendation_txt"].value;
                                msg.description = "security_rating : " + active_state.contextvariables["security_rating"].value
                                    + " security_incidents : " + active_state.contextvariables["security_incidents"].value;
                                publisher.publish('recommendations', JSON.stringify(msg));
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
                        event: 'new_MMT-SecurityIncidents_'+analysisId,
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
                        event: 'new_MMT-SecurityIncidents_'+analysisId,
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
        return efsm;
    },
};
module.exports = EFSM;