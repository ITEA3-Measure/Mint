EFSM = {
    create: function(options) {
        console.log(options['analysisId']);
        var mmt = options['mmt'];
        var publisher = options['publisher'];
        var threshold = options['threshold'];
        var analysisId = options['analysisId'];

        var efsm = new mmt.EFSM(
            {
                id: "test_code_review",
                hascontext: true,
                logdata: true,
                onCreation: function () {},
                onDeletion: function () {},
                events: ['new_IssuesBySeverityBySonarCube', 'new_ReliabilityRatingBySonarCube', 'new_uncovered_conditions', 'timeout.to'],
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
                        to: 'issues_by_severity_received',
                        event: 'new_IssuesBySeverityBySonarCube',
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
                        event: 'new_ReliabilityRatingBySonarCube',
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
                        event: 'new_IssuesBySeverityBySonarCube',
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
                        event: 'new_ReliabilityRatingBySonarCube',
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
                        event: 'new_ReliabilityRatingBySonarCube',
                        conditions: [{fct: function(active_state, evt, msg) {
                                active_state.contextvariables["reliability_rating"].value = msg.data.value;
                                var issues_by_severity = active_state.contextvariables["issues_by_severity"].value;
                                var reliability_rating = active_state.contextvariables["reliability_rating"].value;
                                if ((issues_by_severity == "major" || issues_by_severity == "critical") && reliability_rating >= "E") {
                                    var msg = active_state.contextvariables["recommendation_txt"].value;
                                    msg.description = "Critical code review : \n"
                                        + "issues_by_severity : " + active_state.contextvariables["issues_by_severity"].value
                                        + " reliability_rating : " + active_state.contextvariables["reliability_rating"].value;
                                    return true;
                                }
                                if ((issues_by_severity == "minor") && (reliability_rating < "E")) {
                                    var msg = active_state.contextvariables["recommendation_txt"].value;
                                    msg.description = "More unit tests : \n"
                                        + "issues_by_severity : " + active_state.contextvariables["issues_by_severity"].value
                                        + " reliability_rating : " + active_state.contextvariables["reliability_rating"].value;
                                    return true;
                                }
                                return false;
                            }}
                        ],
                        actions: [{fct: function (active_state, evt, msg){
                                console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                                console.log(evt);
                                console.log(active_state.contextvariables["recommendation_txt"].value);
                                var msg = active_state.contextvariables["recommendation_txt"].value;
                                publisher.publish('recommendations', JSON.stringify(msg));
                            }},
                            {fct: mmt.startTimer, opts: {timeout: 1000, name: 'to'}}]
                    },
                    {
                        from: 'reliability_rating_received',
                        to: 'recommendation',
                        event: 'new_IssuesBySeverityBySonarCube',
                        conditions: [{fct: function(active_state, evt, msg) {
                                active_state.contextvariables["issues_by_severity"].value = msg.data.value;
                                var issues_by_severity = active_state.contextvariables["issues_by_severity"].value;
                                var reliability_rating = active_state.contextvariables["reliability_rating"].value;
                                if ((issues_by_severity == "major" || issues_by_severity == "critical") && reliability_rating >= "E") {
                                    var msg = active_state.contextvariables["recommendation_txt"].value;
                                    msg.description = "Critical code review : \n"
                                        + "issues_by_severity : " + active_state.contextvariables["issues_by_severity"].value
                                        + " reliability_rating : " + active_state.contextvariables["reliability_rating"].value;
                                    return true;
                                }
                                if ((issues_by_severity == "minor") && (reliability_rating < "E")) {
                                    var msg = active_state.contextvariables["recommendation_txt"].value;
                                    msg.description = "More unit tests : \n"
                                        + "issues_by_severity : " + active_state.contextvariables["issues_by_severity"].value
                                        + " reliability_rating : " + active_state.contextvariables["reliability_rating"].value;
                                    return true;
                                }
                                return false;
                            }}
                        ],
                        actions: [{fct: function (active_state, evt, msg){
                                console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                                console.log(evt);
                                console.log(active_state.contextvariables["recommendation_txt"].value);
                                var msg = active_state.contextvariables["recommendation_txt"].value;
                                publisher.publish('recommendations', JSON.stringify(msg));
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
    },
};
module.exports = EFSM;