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
        createdAt: DataTypes.DATE,
        name: DataTypes.STRING,
        measureProjectId: DataTypes.INTEGER,
    });

    Project.associate = function (models) {
        models.Project.hasMany(models.Analysis);
    }

    return Project;
};