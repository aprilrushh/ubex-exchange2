// 파일: backend/models/deposit.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Deposit = sequelize.define('Deposit', {
    id:         { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    wallet_id:  { type: DataTypes.BIGINT, allowNull: false },
    tx_hash:    { type: DataTypes.STRING(66), allowNull: false },
    amount:     { type: DataTypes.DECIMAL(36,18), allowNull: false },
    confirmed:  { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'deposits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Deposit.associate = models => {
    Deposit.belongsTo(models.Wallet, { foreignKey: 'wallet_id' });
  };

  return Deposit;
};
