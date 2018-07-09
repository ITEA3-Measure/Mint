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
                id: "requirements",
                hascontext: true,
                logdata: true,
                onCreation: function () {},
                onDeletion: function () {},
                events: ['new_IssuesBySonarCube_'+analysisId, 'new_ReopenedIssuesBySonarCube_'+analysisId, 'timeout.to'],
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
                        to: 'number_issues_received',
                        event: 'new_IssuesBySonarCube_'+analysisId,
                        actions: [{fct: function (active_state, evt, msg){
                                console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                                console.log(evt);
                                active_state.contextvariables["number_issues"].value = msg.data.value;
                                console.log("number_issues : " + active_state.contextvariables["number_issues"].value);
                                console.log("number_reopen_issues : " + active_state.contextvariables["number_reopen_issues"].value);
                            }},
                            {fct: mmt.startTimer, opts: {timeout: config.app.machineTimeout, name: 'to'}}]
                    },
                    {
                        from: 'init',
                        to: 'number_reopen_issues_received',
                        event: 'new_ReopenedIssuesBySonarCube_'+analysisId,
                        actions: [{fct: function (active_state, evt, msg){
                                console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                                console.log(evt);
                                active_state.contextvariables["number_reopen_issues"].value = msg.data.value;
                                console.log("number_issues : " + active_state.contextvariables["number_issues"].value);
                                console.log("number_reopen_issues : " + active_state.contextvariables["number_reopen_issues"].value);
                            }},
                            {fct: mmt.startTimer, opts: {timeout: config.app.machineTimeout, name: 'to'}}]
                    },
                    {
                        from: 'number_issues_received',
                        to: 'number_issues_received',
                        event: 'new_IssuesBySonarCube_'+analysisId,
                        actions: [{fct: function (active_state, evt, msg){
                                console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                                console.log(evt);
                                active_state.contextvariables["number_issues"].value = msg.data.value;
                            }},
                            {fct: mmt.startTimer, opts: {timeout: config.app.machineTimeout, name: 'to'}}]
                    },
                    {
                        from: 'number_reopen_issues_received',
                        to: 'number_reopen_issues_received',
                        event: 'new_ReopenedIssuesBySonarCube_'+analysisId,
                        actions: [{fct: function (active_state, evt, msg){
                                console.log('>>>>>>>>>>>>>>> : ' + active_state.state.id);
                                console.log(evt);
                                active_state.contextvariables["number_reopen_issues"].value = msg.data.value;
                            }},
                            {fct: mmt.startTimer, opts: {timeout: config.app.machineTimeout, name: 'to'}}]
                    },
                    {
                        from: 'number_reopen_issues_received',
                        to: 'recommendation',
                        event: 'new_IssuesBySonarCube_'+analysisId,
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
                                // edit detail message
                                var msg = active_state.contextvariables["recommendation_txt"].value;
                                msg.description = "number_issues : " + active_state.contextvariables["number_issues"].value
                                    + " number_reopen_issues : " + active_state.contextvariables["number_reopen_issues"].value
                                    + " threshold : " + active_state.contextvariables["threshold"].value;
                                publisher.publish('recommendations', JSON.stringify(msg));
                            }},
                            {fct: mmt.startTimer, opts: {timeout: 1000, name: 'to'}}]
                    },
                    {
                        from: 'number_issues_received',
                        to: 'recommendation',
                        event: 'new_ReopenedIssuesBySonarCube_'+analysisId,
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
                                // edit detail message
                                var msg = active_state.contextvariables["recommendation_txt"].value;
                                msg.description = "number_issues : " + active_state.contextvariables["number_issues"].value
                                    + " number_reopen_issues : " + active_state.contextvariables["number_reopen_issues"].value
                                    + " threshold : " + active_state.contextvariables["threshold"].value;
                                publisher.publish('recommendations', JSON.stringify(msg));
                            }},
                            {fct: mmt.startTimer, opts: {timeout: 1000, name: 'to'}}]
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
        return efsm;
    },
};
module.exports = EFSM;
