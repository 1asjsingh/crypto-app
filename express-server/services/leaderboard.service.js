const { portfolioCalc } = require("../services/portfolio.service");
const db = require("../firestore");
const coingecko = require("./coingecko.service");

const { supportedCurrencies } = require("../config");

const getPortfolioLeaderboard = async (currency) => {
  let portfolioLeaderboard;
  try {
    portfolioLeaderboard = await db
      .collection(process.env.FIREBASE_LEADERBOARDS_COLLECTION)
      .where("currency", "==", currency)
      .get();
  } catch (err) {
    // FIXME: Bad error handling
    throw new Error(
      `couldn't fetch portfolio leaderboard for currency ${currency}`
    );
  }
  // FIXME: Don't think this should throw?
  portfolioLeaderboard = portfolioLeaderboard.docs
    .map((data) => ({ ...data.data() }))
    .filter((curr) => curr.PL !== 0);
  portfolioLeaderboard.sort((x, y) => y.PL - x.PL);
  return portfolioLeaderboard;
};

const getGameLeaderboard = async () => {
  let gameLeaderboard;
  try {
    gameLeaderboard = await db
      .collection(process.env.FIREBASE_LEADERBOARDS_COLLECTION)
      .where("score", ">", 0)
      .get();
  } catch (err) {
    // FIXME: Bad error handling
    throw new Error("couldn't fetch game leaderboard");
  }
  gameLeaderboard = gameLeaderboard.docs
    .map((data) => ({ ...data.data() }))
    .slice(0, 10);
  gameLeaderboard.sort((x, y) => y.score - x.score);
  return gameLeaderboard;
};

const updateUserGameScore = async (userId, newScore) => {
  let currentUserStatsRef = db
    .collection(process.env.FIREBASE_LEADERBOARDS_COLLECTION)
    .doc(userId);
  let currentUserStats;
  try {
    currentUserStats = await currentUserStatsRef.get();
  } catch (err) {
    // FIXME: Bad error handling
    throw new Error("couldn't fetch user's stats on leaderboard");
  }

  let currScore = currentUserStats.data().score;
  if (parseInt(currScore) >= parseInt(newScore)) {
    return;
  }

  try {
    await currentUserStatsRef.update({ score: newScore });
  } catch (err) {
    // FIXME: Bad error handling
    throw new Error("couldn't update user's highest game score on leaderboard");
  }
};

const leaderboardUpdate = async (currency) => {
  const cryptoAccounts = db.collection(process.env.FIREBASE_USERS_COLLECTION);
  let allAccounts;
  try {
    allAccounts = await cryptoAccounts.where("currency", "==", currency).get();
  } catch (err) {
    // FIXME: Bad error handling
    throw new Error(`couldnt fetch accounts with currency ${currency}`);
  }

  await coingecko.getCurrentPrices(currency.substring(0, 3));
  allAccounts.forEach(async (account) => {
    let portfolio;
    try {
      portfolio = await portfolioCalc(account.id, currency.substring(0, 3));
    } catch (err) {
      // FIXME: bad error handling
      throw new Error("couldn't calculate the portfolio");
    }
    const leaderboardDB = db.collection("crypto-leaderboard").doc(account.id);
    try {
      await leaderboardDB.update({
        PL: portfolio.balanceIncProfits - 100000,
      });
    } catch (err) {
      // FIXME: bad error handling
      throw new Error("couldn't update the portfolio leaderboard");
    }
  });
};

const executeLeaderboardUpdate = () => {
  console.log("Updating leaderboards...");
  // FIXME: Shouldn't hardcode these strings here
  ["usd$", "cad$", "gbp£"].forEach((curr) => {
    leaderboardUpdate(curr).catch((err) => {
      console.log(err);
      console.log(err.message);
    });
  });
};

module.exports = {
  getPortfolioLeaderboard,
  getGameLeaderboard,
  updateUserGameScore,
  leaderboardUpdate,
  executeLeaderboardUpdate,
};
