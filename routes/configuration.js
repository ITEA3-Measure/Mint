var express = require('express');
var router = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');

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
    console.log("req.body.recommendation : " + req.body.recommendation);
    console.log("req.body.threshold : " + req.body.threshold);
    var updateValues = {
        name: req.body.name,
        description: req.body.description,
        recommendation : req.body.recommendation,
        threshold : req.body.threshold
    };
    models.Analysis.update(req.body,
        {
            where: {
                id: analysisId
            }
        }
        ).then(function (result) {
            console.log(result);
    })
});

router.get('/analysis/:analysisId', function (req, res, next) {
    var analysisId = req.params.analysisId;
    console.log("GET req.params.analysisId : " + analysisId);
    models.Analysis.findById(analysisId).then(function (analysis) {
        res.json(analysis);
    });
});

module.exports = router;