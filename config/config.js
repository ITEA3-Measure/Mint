const env = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : 'development'; // 'development', 'test', 'production'
console.log("--- NODE_ENV : " + env);
const development = {
    app: {
        port: 3000,
        name: 'MINT',
        description: 'Metric Intelligence Tool',
        configurationURL: 'http://localhost:3000/config',
        configureURL: 'http://localhost:3000/configure/',
        historyURL: 'http://localhost:3000/history/',
        measurementsCronTime: '*/600 * * * * *',
        machineTimeout: 600
    },
    db: {
        dialect: 'mysql',
        host: '127.0.0.1',
        port: 3306,
        name: 'mint_db',
        username: 'root',
        password: 'root'
    },
    measure: {
        host: 'localhost',
        port: 8085,
        alertPath: '/api/analysis/alert/list/',
        registrationPath: '/api/analysis/register',
        configurePath: '/api/analysis/configure',
        measurementsPath: '/api/measurement/find',
        projectInstances: '/api/project-measure-instances/'
    },
    redis: {
        type: 'redis',
        host: '127.0.0.1',
        port: 6379
    }
};

const test = {
    app: {
        port: 3000,
        name: 'MINT',
        description: 'Metric Intelligence Tool',
        configurationURL: 'http://localhost:3000/config',
        configureURL: 'http://localhost:3000/configure/',
        historyURL: 'http://localhost:3000/history/',
        measurementsCronTime: '*/600 * * * * *',
        machineTimeout: 600
    },
    db: {
        dialect: 'mysql',
        host: '127.0.0.1',
        port: 3306,
        name: 'mint_db',
        username: 'root',
        password: 'root'
    },
    measure: {
        host: 'localhost',
        port: 8085,
        alertPath: '/api/analysis/alert/list/',
        registrationPath: '/api/analysis/register',
        configurePath: '/api/analysis/configure',
        measurementsPath: '/api/measurement/find',
        projectInstances: '/api/project-measure-instances/'
    },
    redis: {
        type: 'redis',
        host: '127.0.0.1',
        port: 6379
    }
};

const production = {
    app: {
        port: 3000,
        name: 'MINT',
        description: 'Metric Intelligence Tool',
        configurationURL: 'http://localhost:3000/config',
        configureURL: 'http://localhost:3000/configure/',
        historyURL: 'http://localhost:3000/history/',
        measurementsCronTime: '*/600 * * * * *',
        machineTimeout: 600
    },
    db: {
        dialect: 'mysql',
        host: '',
        port: 3306,
        name: 'mint_db_prod',
        username: '',
        password: ''
    },
    measure: {
        host: '',
        port: '',
        alertPath: '/api/analysis/alert/list/',
        registrationPath: '/api/analysis/register',
        configurePath: '/api/analysis/configure',
        measurementsPath: '/measure/api/measurement/find',
        projectInstances: 'measure/api/project-measure-instances/'
    },
    redis: {
        type: 'redis',
        host: '',
        port: ''
    }
};

var config = {
    development,
    test,
    production
};

module.exports = config[env];