// backend/config/whitelist.js
// Configuration related to withdrawal whitelist behaviour

require('dotenv').config();

// Default values used for development/production
const defaults = {
  emailVerification: true,          // require email verification when adding a new address
  waitingPeriod: 24 * 60 * 60,      // seconds before a new address can be used
  instantConfirm: false             // if true, address is usable immediately
};

const configs = {
  development: {
    emailVerification: process.env.EMAIL_VERIFICATION
      ? process.env.EMAIL_VERIFICATION === 'true'
      : defaults.emailVerification,
    waitingPeriod: process.env.WAITING_PERIOD
      ? parseInt(process.env.WAITING_PERIOD, 10)
      : defaults.waitingPeriod,
    instantConfirm: process.env.INSTANT_CONFIRM
      ? process.env.INSTANT_CONFIRM === 'true'
      : defaults.instantConfirm
  },
  // Testing uses very relaxed rules so unit tests run quickly
  test: {
    emailVerification: false,
    waitingPeriod: 0,
    instantConfirm: true
  },
  production: {
    emailVerification: process.env.EMAIL_VERIFICATION
      ? process.env.EMAIL_VERIFICATION === 'true'
      : defaults.emailVerification,
    waitingPeriod: process.env.WAITING_PERIOD
      ? parseInt(process.env.WAITING_PERIOD, 10)
      : defaults.waitingPeriod,
    instantConfirm: process.env.INSTANT_CONFIRM
      ? process.env.INSTANT_CONFIRM === 'true'
      : defaults.instantConfirm
  }
};

const env = process.env.NODE_ENV || 'development';

module.exports = configs[env];

