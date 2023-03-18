const axios = require("axios");

const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 60 });

const BASE_URL = `https://api.coingecko.com/api/v3/`;
const supportedCurrencies = ["usd", "gbp", "cad"];
const supportedCoins = [
  "bitcoin",
  "ethereum",
  "tether",
  "binancecoin",
  "usd-coin",
  "ripple",
  "okb",
  "cardano",
  "dogecoin",
  "matic-network",
  "binance-usd",
  "staked-ether",
  "solana",
  "polkadot",
  "shiba-inu",
  "litecoin",
  "tron",
  "avalanche-2",
  "dai",
  "uniswap",
  "the-open-network",
  "cosmos",
  "wrapped-bitcoin",
  "chainlink",
  "leo-token",
  "ethereum-classic",
  "monero",
  "bitcoin-cash",
  "filecoin",
  "stellar",
  "lido-dao",
  "aptos",
  "crypto-com-chain",
  "quant-network",
  "hedera-hashgraph",
  "vechain",
  "near",
  "apecoin",
  "algorand",
  "internet-computer",
  "eos",
  "the-graph",
  "true-usd",
  "fantom",
  "the-sandbox",
  "flow",
  "aave",
  "elrond-erd-2",
  "decentraland",
  "frax",
  "tezos",
  "theta-token",
  "axie-infinity",
  "blockstack",
  "havven",
  "terra-luna",
  "kucoin-shares",
  "immutable-x",
  "neo",
  "huobi-token",
  "paxos-standard",
  "maker",
  "rocket-pool",
  "dash",
  "bitcoin-cash-sv",
  "usdd",
  "frax-share",
  "mina-protocol",
  "pancakeswap-token",
  "klay-token",
  "gatechain-token",
  "curve-dao-token",
  "bittorrent",
  "bitdao",
  "chiliz",
  "compound-usd-coin",
  "ecash",
  "iota",
  "trust-wallet-token",
  "bitget-token",
  "gemini-dollar",
  "gmx",
  "singularitynet",
  "cdai",
  "whitebit",
  "edgecoin-2",
  "optimism",
  "oec-token",
  "wemix-token",
  "tokenize-xchange",
  "pax-gold",
  "tether-gold",
  "zcash",
  "osmosis",
  "fetch-ai",
  "zilliqa",
  "thorchain",
  "casper-network",
  "compound-ether",
  "convex-finance",
];

const getCurrencies = async (req, res) => {
  try {
    const currency = req.params["currency"];

    if (!supportedCurrencies.includes(currency)) {
      return res.status(400).json({ message: "Unsupported currency" });
    }

    if (myCache.has(currency)) {
      console.log("Getting API Data from cache");
      return res.status(200).send(myCache.get(currency));
    } else {
      for (let i = 0; i < supportedCurrencies.length; i++) {
        let response = await axios(
          BASE_URL +
            `coins/markets?vs_currency=${supportedCurrencies[i]}&ids=bitcoin%2C%20ethereum%2C%20tether%2C%20binancecoin%2C%20usd-coin%2C%20ripple%2C%20okb%2C%20cardano%2C%20dogecoin%2C%20matic-network%2C%20binance-usd%2C%20staked-ether%2C%20solana%2C%20polkadot%2C%20litecoin%2C%20tron%2C%20avalanche-2%2C%20dai%2C%20uniswap%2C%20the-open-network%2C%20cosmos%2C%20wrapped-bitcoin%2C%20chainlink%2C%20leo-token%2C%20ethereum-classic%2C%20monero%2C%20bitcoin-cash%2C%20filecoin%2C%20stellar%2C%20lido-dao%2C%20aptos%2C%20crypto-com-chain%2C%20quant-network%2C%20hedera-hashgraph%2C%20vechain%2C%20near%2C%20apecoin%2C%20algorand%2C%20internet-computer%2C%20eos%2C%20the-graph%2C%20true-usd%2C%20fantom%2C%20the-sandbox%2C%20flow%2C%20aave%2C%20elrond-erd-2%2C%20decentraland%2C%20frax%2C%20tezos%2C%20theta-token%2C%20axie-infinity%2C%20blockstack%2C%20havven%2C%20kucoin-shares%2C%20immutable-x%2C%20neo%2C%20huobi-token%2C%20paxos-standard%2C%20maker%2C%20rocket-pool%2C%20dash%2C%20bitcoin-cash-sv%2C%20usdd%2C%20frax-share%2C%20mina-protocol%2C%20pancakeswap-token%2C%20klay-token%2C%20gatechain-token%2C%20curve-dao-token%2C%20bitdao%2C%20chiliz%2C%20compound-usd-coin%2C%20iota%2C%20trust-wallet-token%2C%20bitget-token%2C%20gemini-dollar%2C%20gmx%2C%20singularitynet%2C%20cdai%2C%20whitebit%2C%20edgecoin-2%2C%20optimism%2C%20oec-token%2C%20wemix-token%2C%20tokenize-xchange%2C%20pax-gold%2C%20tether-gold%2C%20zcash%2C%20osmosis%2C%20fetch-ai%2C%20zilliqa%2C%20thorchain%2C%20casper-network%2C%20compound-ether%2C%20convex-finance&order=market_cap_desc&per_page=100&page=1&sparkline=false`
        );

        response = response.data;
        myCache.set(supportedCurrencies[i], response, 60);
      }
      console.log("Getting API Data from CoinGecko API");

      return res.status(200).send(myCache.get(currency));
    }
  } catch (e) {
    console.log(e.message);
    if (e.response) {
      return res
        .status(e.response.status || 500)
        .json({ message: "Unexpected Server Error: /getPortfolio" });
    }
  }
};

module.exports = { getCurrencies };
