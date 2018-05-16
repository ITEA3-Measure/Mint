'use strict';
/*
* populate machines table
* command : sequelize db:seed:all
*/

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('efsms', [
        {
        name: 'Modularity',
        description: 'cc : class complexity\n' +
        'mr : maintanability rating\n' +
        '\n' +
        'cc/mr > threshold',
        file: 'modularity.js',
        category: 'Code Quality',
        role: 'Developer/Designer',
        threshold: 50,
        message: 'Reinforce the modular design of your development to allow more extensible, reusable, maintainable, and adaptable code.'
        },
        {
        name: 'Requirements Definition',
        description: ' \n' +
        'n : number of issues\n' +
        'nr : number of reopen issues\n' +
        '\n' +
        'nr > (threshold% of n)\n',
        file: 'requirements.js',
        category: 'Specification',
        role: 'Analyst',
        threshold: 5,
        message: 'Refine requirements definitions or provide more details to avoid development rework'
        },
        {
        name: 'Response time',
        description: 'rt : response time\n' +
        'b : bandwidth\n' +
        '\n' +
        'rt(i) > rt(i-1) && b(i) == b(i-1)',
        file: 'performance.js',
        category: 'Performance',
        role: 'Operator',
        threshold: 50,
        message: 'Check the last commit for problems in the code that generate a longer response time'
        },
        {
        name: 'Vulnerabilities',
        description: 'sr : security rating\n' +
        'si : security incidents\n' +
        '\n' +
        'sr > "C" && si > max => check vulnerabilies',
        file: 'vulnerabilities.js',
        category: 'Security',
        role: 'Security Expert',
        threshold: 50,
        message: 'Check code for vulnerabilities like error handling or input validation'
        },
        {
        name:'Code Quality',
        description: 'rr : reliability rating\n' +
        'ibs : issues by severity\n' +
        '\n' +
        'ibs(major, critical) > 0 && rr >= E => critical code review\n' +
        'ibs(minor) > 0 && rr < E => more unit test',
        file: 'codeQuality.js',
        category: 'Code Quality',
        role: 'Developer/Tester',
        threshold: 50,
        message: 'There is unsolved major issues in the code, make a code review and look for untested scenarios'
        }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('efsms', null, {});
  }
};
