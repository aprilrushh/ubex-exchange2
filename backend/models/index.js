// 파일: ubex-exchange/backend/models/index.js
'use strict';

const fs      = require('fs');
const path    = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env      = process.env.NODE_ENV || 'development';
const config   = require('../config/config.js')[env];

// 명시적으로 User 모델을 불러와 초기화합니다.
const UserModel = require('./User');

const db = {};
let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// User 모델 초기화
db.User = UserModel(sequelize, Sequelize.DataTypes);

// 현재 폴더의 모델 파일들 모두 읽어서 초기화
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file !== 'User.js' &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// 모델 간의 관계 설정
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
