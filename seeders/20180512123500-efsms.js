'use strict';
/*
* populate machines table
* command : sequelize db:seed:all
*/

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('efsms', [
        {
        name: 'Software Modularity',
        description: 'Considering that a modular' +
        ' code can be more understandable and maintainable' +
        ' this machine correlates two metrics to compute the ratio : \n' +
        'R = class complexity/maintainability rating \n' +
        ' If this ratio is more than the threshold a recommendation is given.',
        file: 'modularity.js',
        category: 'Code Quality',
        role: 'Developer/Designer',
        threshold: 50,
        message: 'Reinforce the modular design of your development to allow more extensible, reusable, maintainable, and adaptable code.'
        },
        {
        name: 'Requirements Quality',
        description: 'Considering that the fact that too many reopen issues' +
        ' during the development process can be related' +
        ' to an ambiguous definition of the requirement,' +
        ' this machine correlates two metrics to compute the ratio : \n' +
        ' R = number of reopened issues/number of issues\n' +
        ' If this ratio is more than the threshold a recommendation is given.',
        file: 'requirements.js',
        category: 'Specification',
        role: 'Analyst',
        threshold: 5,
        message: 'Refine requirements definitions or provide more details to avoid development rework'
        },
        {
        name: 'Software Performance',
            description: 'Considering that the response time denotes the delay' +
            ' that can be caused by the software, hardware or networking' +
            ' part that is computed during operation. This delay is in general' +
            ' the same for a constant bandwidth (an equivalent number' +
            ' of users and concurrent sessions). Based on this finding, we' +
            ' can correlate the two metrics and compute that the response' +
            ' time is not increasing for during time for the same bandwidth usage.' +
            ' If this response time is increasing, a recommendation is given.',

            file: 'performance.js',
        category: 'Performance',
        role: 'Operator',
        threshold: 0,
        message: 'Check the last commit for problems in the code that generate a longer response time'
        },
        {
        name: 'Software Security',
        description: 'Considering that a reliable code should be at last free of major' +
        ' vulnerabilities, this machine check if there is a major vulnerability' +
        ' and that the number of attacks at runtime are more than a threshold to give a recommendation',
        file: 'vulnerabilities.js',
        category: 'Security',
        role: 'Security Expert',
        threshold: 0,
        message: 'Check code for vulnerabilities like error handling or input validation'
        },
        {
        name:'Code Reliability',
        description: 'Considering that a reliable code should' +
        ' be at last free of major or critical issues, we can check that' +
        ' there is no major, critical nor blocker issues and the reliability' +
        ' rating is < C corresponding to 1 Major bug.' +
        'If this condition is not satisfied, a recommendation is provided',
        file: 'codeQuality.js',
        category: 'Code Quality',
        role: 'Developer/Tester',
        threshold: 0,
        message: 'There is unsolved major issues in the code, make a code review and look for untested scenarios'
        }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('efsms', null, {});
  }
};
