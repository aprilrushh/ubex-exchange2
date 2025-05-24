// 파일: backend/models/whitelist_address.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const WhitelistAddress = sequelize.define('WhitelistAddress', {
    id:          { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id:     { type: DataTypes.BIGINT, allowNull: false, unique: 'user_coin_address' },
    coin_symbol: { type: DataTypes.STRING(10), allowNull: false, unique: 'user_coin_address' },
    address:     { type: DataTypes.STRING(128), allowNull: false, unique: 'user_coin_address' },
    label:       { type: DataTypes.STRING(50) },
    status:      { type: DataTypes.ENUM('pending','confirmed','rejected'), allowNull: false, defaultValue: 'pending' },
    confirmed_at:{ type: DataTypes.DATE },
    last_used_at:{ type: DataTypes.DATE }
  }, {
    tableName: 'whitelist_addresses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return WhitelistAddress;
};
