"use strict";
module.exports = function (sequelize, DataTypes) {
    var Analysis = sequelize.define('Analysis', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        createdAt: DataTypes.DATE,
        name: DataTypes.STRING,
        description: DataTypes.STRING,
        isSchedule: DataTypes.BOOLEAN
    });

    Analysis.associate = function (models) {
        models.Analysis.belongsTo(models.Project, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });
        models.Analysis.belongsTo(models.Efsm, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });
    };

    return Analysis;
};