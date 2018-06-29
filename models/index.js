var config = require('../config/config');
var fs        = require('fs');
var path      = require('path');
const Sequelize = require('sequelize');
var basename  = path.basename(__filename);
var db = {};

const sequelize = new Sequelize({
    database: config.db.name,
    username: config.db.username,
    password: config.db.password,
    dialect: config.db.dialect,
    host: config.db.host,
    timezone: 'Europe/Paris',
    dialectOptions: {
        useUTC: false, //for reading from database
        dateStrings: true,

        typeCast: function (field, next) { // for reading from database
            if (field.type === 'DATETIME') {
                return field.string()
            }
            return next()
        },
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

//check connection
sequelize.authenticate()
    .then(function () {
        console.log('Connection has been established successfully.');
}).catch(function(err) {
    console.error('Unable to connect to the database:', err)
})
    .done();

fs
    .readdirSync(__dirname)
    .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
})
.forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
    db[modelName].associate(db);
}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;