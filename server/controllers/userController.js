const db = require("../firestore");

const getUserData = async (req, res) => {
  try {
    const id = req.params["id"];

    const cryptoAccount = db.collection("crypto-accounts").doc(id);

    let userDetails = await cryptoAccount.get();
    userDetails = userDetails.data();

    res.send(userDetails);
  } catch (e) {
    console.log("Error in /getUserData");
    res.status(500).json({ message: "Unexpected Server Error: /getUserData" });
  }
};

module.exports = { getUserData };
