var config = require('../config/config');
var http = require('http');
var express = require('express');
var router = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var machines = require('../routes/machinesCron');

// router.use(bodyParser.json);

router.post('/:project', function (req, res, next) {
    console.log("POST");
    console.log("req.body.name " + req.body.name);
    var name = req.body.name;
    var projectId;
    var machineId;
    var analysis = new models.Analysis({
        name: name
    });
});

router.get('/:project', function (req, res, next) {
    console.log("req.params.project : " + req.params.project);
    var projectId = req.params.project;
    models.Analysis.findAll({
        where: {
            ProjectId: projectId
        },
        include: [
            {model: models.Efsm,
                require: false},
            {model: models.Project,
                require: true},
            {model: models.Instance,
                require: true,
                include: [
                    {
                        model: models.Measure,
                        require:true
                    }
                ]}
        ]
    }).then(function (analysis) {
        var result = {};
        for(var i=0; i<analysis.length; i++) {
            var id = analysis[i].id;
            result[id] = analysis[i];
        }
        res.render('config', {
            title: 'Configuration',
            analyses: result
        })
    });
});

router.post('/analysis/:analysisId', function (req, res, next) {
    var analysisId = req.params.analysisId;
    console.log("POST req.params.analysisId : " + analysisId);

    var updatedValues;
    if(req.body.status) {
        updateValues = {
            status: req.body.status
        };
    }
    else {
        updateValues = {
            name: req.body.name,
            description: req.body.description,
            customMessage : req.body.customMessage,
            customThreshold : req.body.customThreshold
        };
    }

    var m = machines.getRunningMachines();
    if(req.body.customThreshold) {
        m[analysisId].contextvars.threshold.value = parseFloat(req.body.customThreshold);
    }
    models.Analysis.update(updateValues,
        {
            where: {
                id: analysisId
            }
        }
        ).then(function (result) {
            console.log("update analysis result" + result);
        models.Analysis.findOne({
            where: {
                id: analysisId
            },
            include: [
                {model: models.Project,
                    require: true}
            ]
        }).then(function (analysis) {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.redirect(req.get('referer'));
        })
    });
});

module.exports = router;