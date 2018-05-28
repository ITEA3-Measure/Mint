var redis = require("redis");
var util = require("util");
var models  = require('../models');

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

var subscriber = redis.createClient(settings.eventbus.port, settings.eventbus.host);
console.log("[" + new Date().toISOString() + "]" + " redis client created");
console.log("[" + new Date().toISOString() + "]" + " redis client subscribed to recommendations channel");
subscriber.on('pmessage', function(pattern,channel, msg) {
    console.log( "[" + new Date().toISOString() + "] " + "New recommendation received: " +msg );
    var msgJson = JSON.parse(msg);
    models.Recommendation.create({
        message: "",
        description: msgJson['description'],
        status: "Active",
        AnalysisId: msgJson['analysisId']
    })
});

subscriber.psubscribe( 'recommendations');

module.exports = subscriber;