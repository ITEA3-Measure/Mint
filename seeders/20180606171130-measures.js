'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('measures', [
        // Software Modularity
        // ClassComplexityBySonarCube MaintainabilityRatingBySonarCube
        {
            name: 'ClassComplexityBySonarCube',
            EfsmId: 1
        },
        {
            name: 'MaintainabilityRatingBySonarCube',
            EfsmId: 1
        },
        // Requirements Quality
        // IssuesBySonarCube ReopenedIssuesBySonarCube
        {
            name: 'IssuesBySonarCube',
            EfsmId: 2
        },
        {
            name: 'ReopenedIssuesBySonarCube',
            EfsmId: 2
        },
        // Software Performance
        // MMT-AppRespTime MMT-Bandwidth
        {
            name: 'MMT-AppRespTime',
            EfsmId: 3
        },
        {
            name: 'MMT-Bandwidth',
            EfsmId: 3
        },
        // Software Security
        // SecurityRatingBySonarCube MMT-SecurityIncidents
        {
            name: 'SecurityRatingBySonarCube',
            EfsmId: 4
        },
        {
            name: 'MMT-SecurityIncidents',
            EfsmId: 4
        },
        // Code Reliability
        // IssuesBySeverityBySonarCube ReliabilityRatingBySonarCube
        {
            name: 'IssuesBySeverityBySonarCube',
            EfsmId: 5
        },
        {
            name: 'ReliabilityRatingBySonarCube',
            EfsmId: 5
        },
    ])
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('measures', null, {});
  }
};
