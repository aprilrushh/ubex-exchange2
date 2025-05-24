'use strict';
module.exports = (sequelize, DataTypes) => {
  const WhitelistConfirmationToken = sequelize.define('WhitelistConfirmationToken', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    token: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    whitelist_id: { type: DataTypes.BIGINT, allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    used: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'whitelist_confirmation_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
  WhitelistConfirmationToken.associate = models => {
    WhitelistConfirmationToken.belongsTo(models.WhitelistAddress, { foreignKey: 'whitelist_id' });
    WhitelistConfirmationToken.belongsTo(models.User, { foreignKey: 'user_id' });
  };
  return WhitelistConfirmationToken;
};
