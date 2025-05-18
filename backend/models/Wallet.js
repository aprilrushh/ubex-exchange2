// 파일: backend/models/wallet.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define('Wallet', {
    id:          { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id:     { type: DataTypes.BIGINT, allowNull: false, unique: 'user_coin' },
    coin_symbol: { type: DataTypes.STRING(10), allowNull: false, unique: 'user_coin' },
    address:     { type: DataTypes.STRING(128), allowNull: false },
    private_key: { type: DataTypes.TEXT, allowNull: false }
  }, {
    tableName: 'wallets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Wallet.associate = models => {
    Wallet.hasMany(models.Deposit,    { foreignKey: 'wallet_id' });
    Wallet.hasMany(models.Withdrawal, { foreignKey: 'wallet_id' });
  };

  return Wallet;
};
