export const getDetails = (coin) =>
  `coins/${coin}?localization=false&tickers=false&market_data=true&developer_data=false&sparkline=false`;

export const getChart = (coin, currency, range) =>
  `coins/${coin}/market_chart?vs_currency=${currency}&days=${range}`;

export const getCandleChart = (coin, currency, range) =>
  `coins/${coin}/ohlc?vs_currency=${currency}&days=${range}`;
