// 파일: ubex-exchange/backend/models/index.js
'use strict';

const fs      = require('fs');
const path    = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env      = process.env.NODE_ENV || 'development';
const config   = require(__dirname + '/../config/config.js')[env];

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

// 현재 폴더의 모델 파일들 모두 읽어서 초기화
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
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

// associate 메서드가 있는 모델은 관계 설정
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
