const requests = {
    getCurrencies: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
    getDetails: `https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&developer_data=false&sparkline=false`
};

export default requests;