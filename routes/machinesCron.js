var config = require('../config/config');
var mmt = require('../utils/mmt-correlator/src/efsm');
var redis = require("redis");
var util = require("util");
var models  = require('../models');
var requirementsEfsm = require('../machines/requirements');
var vulnerabilitiesEfsm = require('../machines/vulnerabilities');
var modularityEfsm = require('../machines/modularity');
var codeQualityEfsm = require('../machines/codeQuality');
var performanceEfsm = require('../machines/performance');

var settings = {
    eventbus: {
        type: config.redis.type,
        host: config.redis.host,
        port: config.redis.port
    }
};

mmt.init(settings);
var publisher = redis.createClient(settings.eventbus.port, settings.eventbus.host);
publisher.config("SET","notify-keyspace-events", "KEA");

var runningMachines = {};

Machines = {
    init: function() {
        models.Analysis.findAll({
            include: [
                {model: models.Efsm,
                    require: false},
                {model: models.Project,
                    require: false}
            ]
        }).then(function (analyses) {
            analyses.forEach(function (analysis) {
                console.log(analysis.Efsm.file);
                if((analysis.Efsm.file).includes("requirements")) {
                    var m = requirementsEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.customThreshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                    runningMachines[analysis.id]=m;
/*                    if (typeof m == "object") {
                        console.log("Object.keys(m) : " +Object.keys(m));
                    }*/
                }
                else if((analysis.Efsm.file).includes("vulnerabilities")) {
                    var m = vulnerabilitiesEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.customThreshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                    runningMachines[analysis.id]=m;
                }
                else if((analysis.Efsm.file).includes("modularity")) {
                    var m = modularityEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.customThreshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                    runningMachines[analysis.id]=m;
                }
                else if((analysis.Efsm.file).includes("codeQuality")) {
                    var m = codeQualityEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.customThreshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                    runningMachines[analysis.id]=m;
                }
                else if((analysis.Efsm.file).includes("performance")) {
                    var m = performanceEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.customThreshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                    runningMachines[analysis.id]=m;
                }
            })
        });
    },
    getRunningMachines : function () {
        return runningMachines;
    },
    initMachineAnalysis : function (analysisId) {
        models.Analysis.findAll({
            where: {
                id: analysisId
            },
            include: [
                {model: models.Efsm,
                    require: false},
                {model: models.Project,
                    require: false}
            ]
        }).then(function (analyses) {
            analyses.forEach(function (analysis) {
                console.log(analysis.Efsm.file);
                if((analysis.Efsm.file).includes("requirements")) {
                    var m = requirementsEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.customThreshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                    runningMachines[analysis.id]=m;
                }
                else if((analysis.Efsm.file).includes("vulnerabilities")) {
                    var m = vulnerabilitiesEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.customThreshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                    runningMachines[analysis.id]=m;
                }
                else if((analysis.Efsm.file).includes("modularity")) {
                    var m = modularityEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.customThreshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                    runningMachines[analysis.id]=m;
                }
                else if((analysis.Efsm.file).includes("codeQuality")) {
                    var m = codeQualityEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.customThreshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                    runningMachines[analysis.id]=m;
                }
                else if((analysis.Efsm.file).includes("performance")) {
                    var m = performanceEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.customThreshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                    runningMachines[analysis.id]=m;
                }
            })
        });
    }
};

module.exports = Machines;