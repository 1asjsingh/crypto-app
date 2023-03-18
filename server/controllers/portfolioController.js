const axios = require("axios");
const db = require("../firestore");
const portfolioCalc = require("./helpers/portfolioCalc");

const BASE_URL = `https://api.coingecko.com/api/v3/`;

const getPortfolio = async (req, res) => {
  try {
    const currency = req.params["currency"];
    const id = req.params["id"];

    let response = await axios(
      BASE_URL +
        `coins/markets?vs_currency=${currency}&ids=bitcoin%2C%20ethereum%2C%20tether%2C%20binancecoin%2C%20usd-coin%2C%20ripple%2C%20okb%2C%20cardano%2C%20dogecoin%2C%20matic-network%2C%20binance-usd%2C%20staked-ether%2C%20solana%2C%20polkadot%2C%20litecoin%2C%20tron%2C%20avalanche-2%2C%20dai%2C%20uniswap%2C%20the-open-network%2C%20cosmos%2C%20wrapped-bitcoin%2C%20chainlink%2C%20leo-token%2C%20ethereum-classic%2C%20monero%2C%20bitcoin-cash%2C%20filecoin%2C%20stellar%2C%20lido-dao%2C%20aptos%2C%20crypto-com-chain%2C%20quant-network%2C%20hedera-hashgraph%2C%20vechain%2C%20near%2C%20apecoin%2C%20algorand%2C%20internet-computer%2C%20eos%2C%20the-graph%2C%20true-usd%2C%20fantom%2C%20the-sandbox%2C%20flow%2C%20aave%2C%20elrond-erd-2%2C%20decentraland%2C%20frax%2C%20tezos%2C%20theta-token%2C%20axie-infinity%2C%20blockstack%2C%20havven%2C%20kucoin-shares%2C%20immutable-x%2C%20neo%2C%20huobi-token%2C%20paxos-standard%2C%20maker%2C%20rocket-pool%2C%20dash%2C%20bitcoin-cash-sv%2C%20usdd%2C%20frax-share%2C%20mina-protocol%2C%20pancakeswap-token%2C%20klay-token%2C%20gatechain-token%2C%20curve-dao-token%2C%20bitdao%2C%20chiliz%2C%20compound-usd-coin%2C%20iota%2C%20trust-wallet-token%2C%20bitget-token%2C%20gemini-dollar%2C%20gmx%2C%20singularitynet%2C%20cdai%2C%20whitebit%2C%20edgecoin-2%2C%20optimism%2C%20oec-token%2C%20wemix-token%2C%20tokenize-xchange%2C%20pax-gold%2C%20tether-gold%2C%20zcash%2C%20osmosis%2C%20fetch-ai%2C%20zilliqa%2C%20thorchain%2C%20casper-network%2C%20compound-ether%2C%20convex-finance&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    );

    response = response.data;

    const data = await portfolioCalc(id, response);

    res.send(data);
  } catch (e) {
    console.log("Error in /getPortfolio");
    console.log(e.message);
    if (e.response) {
      res
        .status(e.response.status || 500)
        .json({ message: "Unexpected Server Error: /getPortfolio" });
    }
  }
};

const getHistory = async (req, res) => {
  try {
    const id = req.params["id"];

    const cryptoAccounts = db.collection("crypto-accounts");

    let transactions = await cryptoAccounts
      .doc(id)
      .collection("transactions")
      .get();

    let transHistory = transactions.docs.map((data) => ({
      coin: data.id,
      ...data.data(),
    }));

    transHistory.sort(function (x, y) {
      return new Date(y.time) - new Date(x.time);
    });

    res.send(transHistory);
  } catch (e) {
    console.log("Error in /getHistory");
    res.status(500).json({ message: "Unexpected Server Error: /getHistory" });
  }
};

module.exports = { getPortfolio, getHistory };
