const cfg = require(process.env.COIN_VS_CURRENCY_PATH);

// TODO MAYBE: We don't really need this if we declare each as comma-separated string in .env?

const supportedCoins = cfg.coin_ids;
const supportedCurrencies = cfg.vs_currencies;

module.exports = {
  supportedCoins,
  supportedCurrencies
};
