var express = require('express');
var router = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');

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
        res.render('config', {
            title: 'Configuration',
            analysis: analysis
        })
    });
});
/*router.get('/', function(req, res, next) {
    models.Project.findAll({
        include: [models.Project]
    }).then(function (projects) {
        res.render('config', {
            title: 'Configuration',
            projects: projects
        })
    });
});*/

module.exports = router;