"use strict";
module.exports = function (sequelize, DataTypes) {
    var Instance = sequelize.define('Instance', {
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

    Instance.associate = function (models) {
        models.Instance.belongsTo(models.Analysis, {
            onDelete: "CASCADE",
            hooks: true,
            foreignKey: {
                allowNull: false
            }
        });
        models.Instance.belongsTo(models.Measure, {
            onDelete: "CASCADE",
            hooks: true,
            foreignKey: {
                allowNull: false
            }
        });
    }

    return Instance;
};