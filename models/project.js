"use strict";
module.exports = function (sequelize, DataTypes) {
    var Project = sequelize.define('Project', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        name: DataTypes.STRING,
        measureProjectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        } ,
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

    Project.associate = function (models) {
        models.Project.hasMany(models.Analysis);
    }

    return Project;
};