var config = require('../config/config');
var redis = require("redis");
var util = require("util");
var models  = require('../models/index');

var settings = {
    eventbus: {
        type: config.redis.type,
        host: config.redis.host,
        port: config.redis.port
    }
};

var subscriber = redis.createClient(settings.eventbus.port, settings.eventbus.host);
console.log("[" + new Date().toISOString() + "]" + " redis client created");
console.log("[" + new Date().toISOString() + "]" + " redis client subscribed to recommendations channel");
subscriber.on('pmessage', function(pattern,channel, msg) {
    console.log( "[" + new Date().toISOString() + "] " + "New recommendation received: " +msg );
    var msgJson = JSON.parse(msg);
    models.Recommendation.create({
        message: "",
        description: msgJson['description'],
        status: "New",
        AnalysisId: msgJson['analysisId']
    })
});

subscriber.psubscribe( 'recommendations');

module.exports = subscriber;