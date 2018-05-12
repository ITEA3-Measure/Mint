var express = require('express');
var router = express.Router();
var models  = require('../models');
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');

router.get('/:project', function(req, res, next) {
    var projectId = req.params.project;
    models.Recommendation.findAll({
        include: [
            {
                model: models.Analysis,
                require: false,
                include: [
                    {
                        model: models.Efsm,
                        require: false
                    }
                ]
            }
        ]
    }).then(function (recommendations) {
        var result = {};
        // last update
        // Machine : recommendation.analysis.name
        // Category : recommendation.analysis.Efsm.category
        // Role : recommendation.analysis.Efsm.role
        // recommendation message
        // list of recommendations
        for(var i=0; i<recommendations.length; i++) {
            var id = recommendations[i].Analysis.id;
            // if key in result add new recommendation to array
            if(id in result){
                r = result[id];
                r.count += 1;
                if(recommendations[i].createdAt.getTime() > r.last_updated.getTime()) {
                    r.last_updated = recommendations[i].createdAt;
                }
                r.recommendations.push(recommendations[i]);
            }
            // if not create element
            else {
                recom_array = [];
                recom_array.push(recommendations[i]);
                result[id] = {
                    id : id,
                    last_updated : recommendations[i].createdAt,
                    machine_name : recommendations[i].Analysis.name,
                    category : recommendations[i].Analysis.Efsm.category,
                    role : recommendations[i].Analysis.Efsm.role,
                    message : recommendations[i].Analysis.customMessage,
                    count : 1,
                    recommendations : recom_array
                }
            }
        };
        //console.log(JSON.stringify(result));
        res.render('history', {
            title: 'History',
            recommendations: recommendations,
            result: sortByDate(result),
            dateFormat: dateFormat
        })
    });
});

function sortByDate(myData) {
    return myData;
};

/*router.get('/:project', function(req, res, next) {
    var projectId = req.params.project;
    var limit = 10;
    var offset = 0;
    console.log("projectId : " + projectId);
    models.Recommendation.findAndCountAll().then(function (data) {
        var page = req.params.page; // page number
        var pages = Math.ceil(data.count / limit);
    });
    models.Recommendation.findAll({
        limit: limit,
        offset: offset,
        // $sort: { id: 1 },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {model: models.Analysis,
            require: false}
        ]
    }).then(function (recommendations) {
        for(var i=0; i<recommendations.length; i++) {
            //console.log(recommendations[i]);
        }
        res.render('history', {
            title: 'History',
            recommendations: recommendations
        })
    });
});*/

module.exports = router;