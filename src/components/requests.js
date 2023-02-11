export const getCurrencies = (currency) =>
  `coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1&sparkline=false`;

export const getDetails = (coin) =>
  `coins/${coin}?localization=false&tickers=false&market_data=true&developer_data=false&sparkline=false`;

export const getChart = (coin, currency, range) =>
  `coins/${coin}/market_chart?vs_currency=${currency}&days=${range}`;

  export const getCandleChart = (coin, currency, range) =>
  `coins/${coin}/ohlc?vs_currency=${currency}&days=${range}`;

//export const searchCurrencies = () => `coins/list?include_platform=false `;

export const getLatestPrices = (coins, currency) =>
  `simple/price?ids=${coins}&vs_currencies=${currency}`; //bitcoin%2Cethereum
