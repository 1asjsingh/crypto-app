const db = require("../firestore")

const buy = async (req, res) => {
  try {
    const { id, coin, quantity, current_price, costPrice } = req.body;

    const cryptoAccount = db.collection("crypto-accounts").doc(id);

    let userDetails = await cryptoAccount.get();
    userDetails = userDetails.data();

    const transactions = await cryptoAccount.collection("transactions").get();

    const transHistory = transactions.docs.map((data) => ({
      coin: data.id,
      ...data.data(),
    }));

    const transactionId = 1 + transHistory.length;

    const batch = db.batch();

    const buy = cryptoAccount
      .collection("transactions")
      .doc(transactionId.toString());

    batch.set(buy, {
      coin: coin,
      quantity: parseFloat(quantity),
      price: parseFloat(current_price),
      time: Date(),
    });

    const balanceUpdate = cryptoAccount;
    batch.update(balanceUpdate, { balance: userDetails.balance - costPrice });

    await batch.commit();

    res.sendStatus(200);
  } catch (e) {
    console.log("Error in /buy");
    console.log(e.message)
    res.status(500).json({ message: "Unexpected Server Error: /buy" });
  }
};

const sell = async (req, res) => {
  try {
    const { id, coin, quantity, current_price, sellPrice } = req.body;

    const cryptoAccount = db.collection("crypto-accounts").doc(id);

    let userDetails = await cryptoAccount.get();
    userDetails = userDetails.data();

    const transactions = await cryptoAccount.collection("transactions").get();

    const transHistory = transactions.docs.map((data) => ({
      coin: data.id,
      ...data.data(),
    }));

    const transactionId = 1 + transHistory.length;

    const batch = db.batch();

    const sale = cryptoAccount
      .collection("transactions")
      .doc(transactionId.toString());

    batch.set(sale, {
      coin: coin,
      quantity: -parseFloat(quantity),
      price: parseFloat(current_price),
      time: Date(),
    });

    const balanceUpdate = cryptoAccount;
    batch.update(balanceUpdate, { balance: userDetails.balance + sellPrice });

    await batch.commit();

    res.sendStatus(200);
  } catch (e) {
    console.log("Error in /sell");
    res.status(500).json({ message: "Unexpected Server Error: /sell" });
  }
};

module.exports = { buy, sell };
