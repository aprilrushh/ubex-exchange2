'use strict';
module.exports = (sequelize, DataTypes) => {
  const ApiKey = sequelize.define('ApiKey', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    api_key: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    api_secret: { type: DataTypes.STRING(64), allowNull: false },
    revoked: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'api_keys',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  ApiKey.associate = models => {
    ApiKey.belongsTo(models.User, { foreignKey: 'user_id' });
  };
  return ApiKey;
};
