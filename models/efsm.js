"use strict";
module.exports = function (sequelize, DataTypes) {
    var Efsm = sequelize.define('Efsm', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        name: DataTypes.STRING,
        description: DataTypes.STRING,
        file: DataTypes.STRING,
    });

    Efsm.associate = function (models) {
        console.log("associating EFSM to ANALYSIS");
        models.Project.hasMany(models.Analysis);
    }

    return Efsm;
};