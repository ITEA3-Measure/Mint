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
        description: DataTypes.TEXT,
        file: DataTypes.STRING,
        category: DataTypes.STRING,
        role: DataTypes.STRING,
        threshold: DataTypes.DOUBLE,
        message: DataTypes.STRING,
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: new Date()
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: new Date()
        }
    });

    Efsm.associate = function (models) {
        models.Efsm.hasMany(models.Analysis);
        models.Efsm.hasMany(models.Measure);
    }

    return Efsm;
};