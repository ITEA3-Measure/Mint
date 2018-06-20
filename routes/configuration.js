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
                require: false}
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
    console.log("req.body.name : " + req.body.name);
    console.log("req.body.description : " + req.body.description);
    console.log("req.body.customMessage : " + req.body.customMessage);
    console.log("req.body.customThreshold : " + req.body.customThreshold);
    console.log("req.body.status : " + req.body.status);

    var m = machines.getRunningMachines();
    if(req.body.customThreshold) {
        m[analysisId].contextvars.threshold.value = req.body.threshold;
    }
/*    for(var i = 0; i < m.length; i++) {
        console.log(m[i].id);
        console.log(m[i].contextvars);
        console.log(m[i].contextvars.threshold);
        console.log(m[i].contextvars.threshold.value = 0);
    }*/
    models.Analysis.update(req.body,
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

router.get('/analysis/:analysisId', function (req, res, next) {
    var analysisId = req.params.analysisId;
    console.log("GET req.params.analysisId : " + analysisId);
    models.Analysis.findById(analysisId).then(function (analysis) {
        res.json(analysis);
    });
});

module.exports = router;