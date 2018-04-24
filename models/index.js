var fs        = require('fs');
var path      = require('path');
const Sequelize = require('sequelize');
var basename  = path.basename(__filename);
const mysql = require('mysql2');
var propertiesReader = require('properties-reader');
var properties = propertiesReader('./config/config.ini');
var property = properties.get('dev.measure-platform.url');
console.log("dev.measure-platform.url : " + property);
var db = {};

const sequelize = new Sequelize({
    database: properties.get('dev.mysql.datasource.database'),
    username: properties.get('dev.mysql.datasource.username'),
    password: properties.get('dev.mysql.datasource.password'),
    dialect: 'mysql',
    host: properties.get('dev.mysql.datasource.host'),
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