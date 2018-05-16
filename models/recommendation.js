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
        message: DataTypes.STRING,
        description: DataTypes.STRING,
        status: {
            type: DataTypes.STRING,
            defaultValue: "Open"
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
            foreignKey: {
                allowNull: false
            }
        });
    };

    return Recommendation;
};