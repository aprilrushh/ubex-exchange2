'use strict';
module.exports = (sequelize, DataTypes) => {
  const Pair = sequelize.define('Pair', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    base: { type: DataTypes.STRING(10), allowNull: false },
    quote: { type: DataTypes.STRING(10), allowNull: false },
    fee: { type: DataTypes.DECIMAL(10,4), allowNull: false, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: 'pairs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Pair;
};
