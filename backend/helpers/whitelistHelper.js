const db = require('../models');

/**
 * 확인된 화이트리스트 주소인지 검사
 * @param {number} userId
 * @param {string} coinSymbol
 * @param {string} address
 * @returns {Promise<boolean>}
 */
async function checkWhitelistAddress(userId, coinSymbol, address) {
  const entry = await db.WhitelistAddress.findOne({
    where: { user_id: userId, coin_symbol: coinSymbol, address }
  });
  return !!(entry && entry.confirmed);
}

module.exports = { checkWhitelistAddress };
