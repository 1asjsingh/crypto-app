const db = require("../firestore");
const createError = require("http-errors");

async function portfolioCalc(id, res2, next) {
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
  } catch (e) {
    next(createError(500, e.message));
  }
}

module.exports = portfolioCalc;
