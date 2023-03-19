const db = require("../firestore");
const users = require("./users.service");

const execute = async (
  userId,
  coin,
  quantity,
  currentPrice,
  totalPrice,
  date,
  buyOrder
) => {

  const user = await users.getDetails(userId);

  // TODO: Create another function that generates a unique transaction ID (use UUID?)
  const transactionHistory = await users.getTransactionHistory(userId);
  const transactionId = 1 + transactionHistory.length;

  const userDB = db
    .collection(process.env.FIREBASE_USERS_COLLECTION)
    .doc(userId);
  const order = userDB
    .collection(process.env.FIREBASE_USERS_TRANSACTIONS_COLLECTION)
    .doc(transactionId.toString());

  const sign = buyOrder ? 1 : -1;
  const batch = db.batch();
  batch.set(order, {
    coin: coin,
    quantity: parseFloat(sign * quantity),
    price: parseFloat(currentPrice),
    time: date,
  });

  let updateBalance = user.balance - sign * totalPrice

  batch.update(userDB, { balance: updateBalance });

  await batch.commit();
};

module.exports = {
  execute,
};
