'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
<<<<<<< HEAD
      unique: true,
=======
>>>>>>> 02baeac7f0d49ae77a4b7a924f12edef507b42a2
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return User;
<<<<<<< HEAD
}; 
=======
};
>>>>>>> 02baeac7f0d49ae77a4b7a924f12edef507b42a2
