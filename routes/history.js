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
                require: true,
                where: {ProjectId: projectId},
                include: [
                    {
                        model: models.Efsm,
                        require: false
                    },
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
                if(recommendations[i].status == "New") {
                    r.countNew += 1;
                }
                if(recommendations[i].createdAt > r.last_updated) {
                    r.last_updated = recommendations[i].createdAt;
                    r.status = recommendations[i].status;
                }
                r.recommendations.push(recommendations[i]);
            }
            // if not create element
            else {
                measures_array = [];
                measures_array.push(recommendations[i]);
                result[id] = {
                    id : id,
                    last_updated : recommendations[i].createdAt,
                    machine_name : recommendations[i].Analysis.name,
                    category : recommendations[i].Analysis.Efsm.category,
                    role : recommendations[i].Analysis.Efsm.role,
                    message : recommendations[i].Analysis.customMessage,
                    count : 1,
                    countNew : (recommendations[i].status == "New")? 1 : 0,
                    status : recommendations[i].status,
                    recommendations : measures_array
                }
            }
        };
        res.render('history', {
            title: 'History',
            recommendations: recommendations,
            result: sortByDate(result),
            dateFormat: dateFormat
        })
    });
});

router.post('/recommendation/:recommendationId', function (req, res, next) {
    console.log("POST recommendationId : " + req.params.recommendationId);
    console.log("POST req : " + req);
    var recommendationId = req.params.recommendationId;
    var status = req.body.status;
    models.Recommendation.update(req.body,
        {
            where: {
                id: recommendationId
            }
        }
    ).then(function (result) {
        console.log("POST RESULT : " + result);
    })
});

function sortByDate(myData) {
    for(var i in myData) {
        myData[i].recommendations.sort(compare);
    }
    return myData;
};

function compare(a,b) {
    if (a.createdAt < b.createdAt)
        return 1;
    if (a.createdAt > b.createdAt)
        return -1;
    return 0;
}

module.exports = router;