const express = require("express");
require("dotenv").config()
const app = express();
const cors = require("cors");
const admin = require("firebase-admin");
const port = 4000;

app.use(cors());

const axios = require("axios");

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://crypto-project-21534.firebaseio.com",
});

const db = admin.firestore();

const baseURL = `https://api.coingecko.com/api/v3/`;

//app.get("/updatePortfolio/:currency", async (req, res) => {
async function leaderboardUpdate(currency) {
  //const currency = req.params["currency"];

  let res2 = await axios.get(
    baseURL +
      `coins/markets?vs_currency=${currency.substring(
        0,
        3
      )}&ids=bitcoin%2C%20ethereum%2C%20tether%2C%20binancecoin%2C%20usd-coin%2C%20ripple%2C%20okb%2C%20cardano%2C%20dogecoin%2C%20matic-network%2C%20binance-usd%2C%20staked-ether%2C%20solana%2C%20polkadot%2C%20litecoin%2C%20tron%2C%20avalanche-2%2C%20dai%2C%20uniswap%2C%20the-open-network%2C%20cosmos%2C%20wrapped-bitcoin%2C%20chainlink%2C%20leo-token%2C%20ethereum-classic%2C%20monero%2C%20bitcoin-cash%2C%20filecoin%2C%20stellar%2C%20lido-dao%2C%20aptos%2C%20crypto-com-chain%2C%20quant-network%2C%20hedera-hashgraph%2C%20vechain%2C%20near%2C%20apecoin%2C%20algorand%2C%20internet-computer%2C%20eos%2C%20the-graph%2C%20true-usd%2C%20fantom%2C%20the-sandbox%2C%20flow%2C%20aave%2C%20elrond-erd-2%2C%20decentraland%2C%20frax%2C%20tezos%2C%20theta-token%2C%20axie-infinity%2C%20blockstack%2C%20havven%2C%20kucoin-shares%2C%20immutable-x%2C%20neo%2C%20huobi-token%2C%20paxos-standard%2C%20maker%2C%20rocket-pool%2C%20dash%2C%20bitcoin-cash-sv%2C%20usdd%2C%20frax-share%2C%20mina-protocol%2C%20pancakeswap-token%2C%20klay-token%2C%20gatechain-token%2C%20curve-dao-token%2C%20bitdao%2C%20chiliz%2C%20compound-usd-coin%2C%20iota%2C%20trust-wallet-token%2C%20bitget-token%2C%20gemini-dollar%2C%20gmx%2C%20singularitynet%2C%20cdai%2C%20whitebit%2C%20edgecoin-2%2C%20optimism%2C%20oec-token%2C%20wemix-token%2C%20tokenize-xchange%2C%20pax-gold%2C%20tether-gold%2C%20zcash%2C%20osmosis%2C%20fetch-ai%2C%20zilliqa%2C%20thorchain%2C%20casper-network%2C%20compound-ether%2C%20convex-finance&order=market_cap_desc&per_page=100&page=1&sparkline=false`
  );
  res2 = res2.data;

  try {
    const cryptoAccounts = db.collection("crypto-accounts");
    const allAccounts = await cryptoAccounts
      .where("currency", "==", currency)
      .get();

    //loop through all accounts
    allAccounts.forEach(async (account) => {
      const data = await getPortfolio(account.id, res2);

      const leaderboardDB = db.collection("crypto-leaderboard").doc(account.id);
      await leaderboardDB.update({
        PL: data.balanceIncProfits - 100000,
      });
    });

    //res.send("temp");
  } catch (e) {
    /*if (e.request) {
      if (e.code === "ERR_NETWORK") { //429
        alert("CoinGecko request limit reached. Please wait 1-2 minutes.");
      }*/
    //res.send(e);
  }
}

async function getPortfolio(id, res2) {
  try {
    const cryptoAccounts = db.collection("crypto-accounts");

    let userDetails = await cryptoAccounts.doc(id).get();
    userDetails = userDetails.data();

    const transactions = await cryptoAccounts
      .doc(id)
      .collection("transactions")
      .get();

    let transHistory = transactions.docs.map((data) => ({
      coin: data.id,
      ...data.data(),
    }));

    transHistory.sort(function (x, y) {
      return new Date(x.time) - new Date(y.time);
    });

    let coins = [];
    let quantity = [];
    let totalPrice = [];
    let openPL = [];

    let docIndex = 0;
    let indexRemove = [];

    transHistory.forEach((doc) => {
      //FIFO
      if (parseFloat(doc.quantity) < 0) {
        let absVal = Math.abs(parseFloat(doc.quantity));
        while (absVal > 0) {
          const index = transHistory.findIndex((i) => i.coin === doc.coin);
          const indexQuantity = parseFloat(transHistory[index]["quantity"]);
          if (indexQuantity > 0 && absVal >= indexQuantity) {
            indexRemove.push(index);
            absVal -= indexQuantity;
            transHistory[index]["coin"] = "SOLD";
          } else if (indexQuantity > 0 && absVal < indexQuantity) {
            transHistory[index]["quantity"] = (
              parseFloat(transHistory[index]["quantity"]) - absVal
            ).toFixed(2); //FLOATING POINT ERROR FIX
            absVal -= indexQuantity;
          }
        }
        indexRemove.push(docIndex);
        transHistory[docIndex]["coin"] = "SELLORDER";
      }
      docIndex += 1;
    });

    indexRemove = indexRemove.sort(function (x, y) {
      return x - y;
    });

    for (let i = indexRemove.length - 1; i >= 0; i--) {
      transHistory.splice(indexRemove[i], 1);
    }

    transHistory.forEach((doc) => {
      const currentPrice = res2.find(({ id }) => id === doc.coin).current_price;
      console.log(currentPrice);

      if (coins.includes(doc.coin)) {
        const i = coins.indexOf(doc.coin);
        quantity[i] += parseFloat(doc.quantity);
        totalPrice[i] += parseFloat(doc.price) * parseFloat(doc.quantity); // total BUY price not current
        openPL[i] += (currentPrice - doc.price) * parseFloat(doc.quantity);
      } else {
        coins.push(doc.coin);
        quantity.push(parseFloat(doc.quantity));
        totalPrice.push(parseFloat(doc.price) * parseFloat(doc.quantity));
        openPL.push((currentPrice - doc.price) * parseFloat(doc.quantity));
      }
    });

    let profits = 0;
    coins.forEach(function (coin, i) {
      profits += openPL[i];
    });

    let totalPriceSum = 0;
    if (totalPrice.length > 0) {
      totalPriceSum = totalPrice.reduce((sum, x) => {
        return sum + x;
      });
    }

    const balanceIncProfits = parseFloat(
      userDetails.balance + totalPriceSum + profits
    );

    return {
      coins: coins,
      quantity: quantity,
      totalPrice: totalPrice,
      openPL: openPL,
      balanceIncProfits: balanceIncProfits,
    };
  } catch (e) {}
}

function executeLeaderboardUpdate() {
  console.log("Updating leaderboards...");

  const currencies = ["usd$", "cad$", "gbp£"];
  currencies.forEach((curr) => {
    leaderboardUpdate(curr);
  });
}

setInterval(executeLeaderboardUpdate, 180000);

app.get("/getPortfolio/:currency/:id", async (req, res) => {
  try {
    const currency = req.params["currency"];
    const id = req.params["id"];

    let response = await axios(
      baseURL +
        `coins/markets?vs_currency=${currency}&ids=bitcoin%2C%20ethereum%2C%20tether%2C%20binancecoin%2C%20usd-coin%2C%20ripple%2C%20okb%2C%20cardano%2C%20dogecoin%2C%20matic-network%2C%20binance-usd%2C%20staked-ether%2C%20solana%2C%20polkadot%2C%20litecoin%2C%20tron%2C%20avalanche-2%2C%20dai%2C%20uniswap%2C%20the-open-network%2C%20cosmos%2C%20wrapped-bitcoin%2C%20chainlink%2C%20leo-token%2C%20ethereum-classic%2C%20monero%2C%20bitcoin-cash%2C%20filecoin%2C%20stellar%2C%20lido-dao%2C%20aptos%2C%20crypto-com-chain%2C%20quant-network%2C%20hedera-hashgraph%2C%20vechain%2C%20near%2C%20apecoin%2C%20algorand%2C%20internet-computer%2C%20eos%2C%20the-graph%2C%20true-usd%2C%20fantom%2C%20the-sandbox%2C%20flow%2C%20aave%2C%20elrond-erd-2%2C%20decentraland%2C%20frax%2C%20tezos%2C%20theta-token%2C%20axie-infinity%2C%20blockstack%2C%20havven%2C%20kucoin-shares%2C%20immutable-x%2C%20neo%2C%20huobi-token%2C%20paxos-standard%2C%20maker%2C%20rocket-pool%2C%20dash%2C%20bitcoin-cash-sv%2C%20usdd%2C%20frax-share%2C%20mina-protocol%2C%20pancakeswap-token%2C%20klay-token%2C%20gatechain-token%2C%20curve-dao-token%2C%20bitdao%2C%20chiliz%2C%20compound-usd-coin%2C%20iota%2C%20trust-wallet-token%2C%20bitget-token%2C%20gemini-dollar%2C%20gmx%2C%20singularitynet%2C%20cdai%2C%20whitebit%2C%20edgecoin-2%2C%20optimism%2C%20oec-token%2C%20wemix-token%2C%20tokenize-xchange%2C%20pax-gold%2C%20tether-gold%2C%20zcash%2C%20osmosis%2C%20fetch-ai%2C%20zilliqa%2C%20thorchain%2C%20casper-network%2C%20compound-ether%2C%20convex-finance&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    );

    response = response.data;

    const data = await getPortfolio(id, response);
    console.log(data);
    res.send(data);
  } catch (e) {}
});

app.get("/getHistory/:id", async (req, res) => {
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
  } catch (e) {}
});

app.get("/getLeaderboard/:currency", async (req, res) => {
  try {
    const currency = req.params["currency"];

    const cryptoLeaderboard = db.collection("crypto-leaderboard");

    const response = await cryptoLeaderboard
      .where("currency", "==", currency)
      .get();

    let pl = response.docs.map((data) => ({
      ...data.data(),
    }));

    pl.sort(function (x, y) {
      return y.PL - x.PL;
    });

    let plFiltered = pl.filter((curr) => {
      return curr.PL !== 0;
    });

    res.send(plFiltered);
  } catch (e) {}
});

app.listen(port, () => {
  console.log(`Express backend listening on port ${port}`);
});
