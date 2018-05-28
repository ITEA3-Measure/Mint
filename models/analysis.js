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
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        customThreshold: DataTypes.DOUBLE,
        customMessage: DataTypes.STRING,
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
        models.Analysis.hasMany(models.Recommendation);
    };

    return Analysis;
};