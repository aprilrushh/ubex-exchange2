// 파일: backend/models/withdrawal.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Withdrawal = sequelize.define('Withdrawal', {
    id:          { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    wallet_id:   { type: DataTypes.BIGINT, allowNull: false },
    to_address:  { type: DataTypes.STRING(128), allowNull: false },
    amount:      { type: DataTypes.DECIMAL(36,18), allowNull: false },
    tx_hash:     { type: DataTypes.STRING(66) },
    status:      { 
      type: DataTypes.ENUM('PENDING','SENT','CONFIRMED','FAILED'),
      allowNull: false,
      defaultValue: 'PENDING'
    }
  }, {
    tableName: 'withdrawals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Withdrawal.associate = models => {
    Withdrawal.belongsTo(models.Wallet, { foreignKey: 'wallet_id' });
  };

  return Withdrawal;
};
