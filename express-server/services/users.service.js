const db = require("../firestore");

const getDetails = async (userId) => {
  const user = await db
    .collection(process.env.FIREBASE_USERS_COLLECTION)
    .doc(userId)
    .get();
  if (!user.exists) {
    throw new Error(`CryptoAppError: User with ID ${userId} not found.`);
  } else {
    return user.data();
  }
};

// TODO MAYBE: Update details?

const getTransactionHistory = async (userId) => {
  const transactions = await db
    .collection(process.env.FIREBASE_USERS_COLLECTION)
    .doc(userId)
    .collection(process.env.FIREBASE_USERS_TRANSACTIONS_COLLECTION)
    .get();
  let transactionHistory = transactions.docs.map((data) => ({
    coin: data.id,
    ...data.data(),
  }));
  // FIXME: Isn't it already sorted by date?
  transactionHistory.sort(function (x, y) {
    return new Date(x.time) - new Date(y.time);
  });
  return transactionHistory;
};

// TODO: `portfolio` is a field on users of type `Map`.
const getPortfolio = async (userId) => {};

const updatePortfolio = async (userId) => {};

const executeTransaction = async (userId) => {};

module.exports = {
  getDetails,
  getTransactionHistory,
};
