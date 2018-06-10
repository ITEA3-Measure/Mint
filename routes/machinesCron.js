var mmt = require('../utils/mmt-correlator/src/efsm');
var redis = require("redis");
var util = require("util");
var models  = require('../models');
var requirementsEfsm = require('../machines/requirements');
var vulnerabilitiesEfsm = require('../machines/vulnerabilities');
var modularityEfsm = require('../machines/modularity');
var codeQualityEfsm = require('../machines/codeQuality');
var performanceEfsm = require('../machines/performance');

if(process.env.REDIS_URL) {
    console.log("process.env.REDIS_URL : " + process.env.REDIS_URL);
    var redisUrl = (process.env.REDIS_URL).split(":");
    var settings = {
        eventbus: {
            type: redisUrl[0],
            host: redisUrl[2],
            port: redisUrl[3]
        }
    };
}
else {
    console.log("No REDIS_URL");
    var settings = {
        eventbus: {
            type: 'redis',
            host: '127.0.0.1',
            port: 6379
        }
    };
}

mmt.init(settings);
var publisher = redis.createClient(settings.eventbus.port, settings.eventbus.host);
publisher.config("SET","notify-keyspace-events", "KEA");

Machines = {
    init: function() {
        models.Analysis.findAll({
            where: {
                status: true
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
                    requirementsEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.Efsm.threshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                }
                else if((analysis.Efsm.file).includes("vulnerabilities")) {
                    vulnerabilitiesEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.Efsm.threshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                }
                else if((analysis.Efsm.file).includes("modularity")) {
                    modularityEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.Efsm.threshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                }
                else if((analysis.Efsm.file).includes("codeQuality")) {
                    codeQualityEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.Efsm.threshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                }
                else if((analysis.Efsm.file).includes("performance")) {
                    performanceEfsm.create({
                        analysisId :analysis.id,
                        threshold : analysis.Efsm.threshold,
                        mmt : mmt,
                        publisher : publisher
                    });
                }
            })
        });
    },
};

module.exports = Machines;