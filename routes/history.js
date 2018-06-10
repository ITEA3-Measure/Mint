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
                    r.status = recommendations[i].status;
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
                    status : recommendations[i].status,
                    recommendations : recom_array
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

function sortByDate(myData) {
    for(var i in myData) {
        myData[i].recommendations.sort(compare);
    }
    return myData;
};

function compare(a,b) {
    if (a.createdAt.getTime() < b.createdAt.getTime())
        return 1;
    if (a.createdAt.getTime() > b.createdAt.getTime())
        return -1;
    return 0;
}

module.exports = router;