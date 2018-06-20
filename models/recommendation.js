"use strict";
module.exports = function (sequelize, DataTypes) {
    var Recommendation = sequelize.define('Recommendation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        message: DataTypes.TEXT,
        description: DataTypes.TEXT,
        status: {
            type: DataTypes.STRING,
            defaultValue: "Active"
        },
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

    Recommendation.associate = function (models) {
        models.Recommendation.belongsTo(models.Analysis, {
            onDelete: "CASCADE",
            hooks: true,
            foreignKey: {
                allowNull: false
            }
        });
    };

    return Recommendation;
};