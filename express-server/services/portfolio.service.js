const users = require("./users.service");
const coingecko = require("./coingecko.service");


const portfolioCalc = async (userId, currency) => {
  let current_prices = await coingecko.getCurrentPrices(currency);

  let userDetails = await users.getDetails(userId);
  // TODO: Catch error or just let it throw?

  let transactionHistory = await users.getTransactionHistory(userId);
  // TODO: Catch error or just let it throw?

  let coins = [];
  let quantity = [];
  let totalPrice = [];
  let openPL = [];

  let docIndex = 0;
  let indexRemove = [];

  // TODO: Check logic and decompose

  transactionHistory.forEach((doc) => {
    //FIFO
    if (parseFloat(doc.quantity) < 0) {
      let absVal = Math.abs(parseFloat(doc.quantity));
      while (absVal > 0) {
        const index = transactionHistory.findIndex((i) => i.coin === doc.coin);
        const indexQuantity = parseFloat(transactionHistory[index]["quantity"]);
        if (indexQuantity > 0 && absVal >= indexQuantity) {
          indexRemove.push(index);
          absVal -= indexQuantity;
          transactionHistory[index]["coin"] = "SOLD";
        } else if (indexQuantity > 0 && absVal < indexQuantity) {
          transactionHistory[index]["quantity"] = (
            parseFloat(transactionHistory[index]["quantity"]) - absVal
          ).toFixed(2); //FLOATING POINT ERROR FIX
          absVal -= indexQuantity;
        }
      }
      indexRemove.push(docIndex);
      transactionHistory[docIndex]["coin"] = "SELLORDER";
    }
    docIndex += 1;
  });

  indexRemove = indexRemove.sort(function (x, y) {
    return x - y;
  });

  for (let i = indexRemove.length - 1; i >= 0; i--) {
    transactionHistory.splice(indexRemove[i], 1);
  }

  transactionHistory.forEach((doc) => {
    const currentPrice = current_prices.find(
      ({ id }) => id === doc.coin
    ).current_price;

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
};

module.exports = {
  portfolioCalc,
};
