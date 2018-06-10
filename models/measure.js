"use strict";
module.exports = function (sequelize, DataTypes) {
    var Measure = sequelize.define('Measure', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        name: DataTypes.STRING,
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

    Measure.associate = function (models) {
        models.Measure.belongsTo(models.Efsm, {
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });
        models.Measure.hasMany(models.Instance);
    }

    return Measure;
};