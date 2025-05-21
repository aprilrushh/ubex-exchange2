'use strict';
module.exports = (sequelize, DataTypes) => {
  const Coin = sequelize.define('Coin', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    symbol: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    decimals: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 8 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: 'coins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Coin;
};
