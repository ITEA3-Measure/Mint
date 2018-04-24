const request = require('request');

function AnalysisRegistrationClient(serverURL) {
    this.serverURL = serverURL;
}

AnalysisRegistrationClient.prototype.serverURL = function(serverURL) {
    this.serverURL = serverURL;
};

AnalysisRegistrationClient.prototype.registerAnalysisTool = function(analysisService) {

};