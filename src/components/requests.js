export const getCurrencies = () =>
  `coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`;

export const getDetails = (coin) =>
  `coins/${coin}?localization=false&tickers=false&market_data=true&developer_data=false&sparkline=false`;

export const getChart = (coin, currency, range) =>
  `coins/${coin}/market_chart?vs_currency=${currency}&days=${range}`;