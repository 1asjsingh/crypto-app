import React, { useEffect, useState } from "react";
import "./Portfolio.css";
import { useAuthentication } from "../contexts/AuthenticationContext";
import { db } from "./firebase";
import {
  getDoc,
  getDocs,
  collection,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import Loading from "./Loading";
import axios from "./axios";
import { getLatestPrices } from "./requests.js";
import { Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";

function Portfolio() {
  const { authedUser } = useAuthentication();
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [coins1, setCoins] = useState([]);
  const [quantity1, setQuantity] = useState([]);
  const [total_price1, setTotal_Price] = useState([]);
  const [openPL1, setOpenPL] = useState([]);
  const [latestPrice, setLatestPrice] = useState([]);
  //const [test1, test12] = useState({btc: {quan: 1, price: 12.3}});

  const [sellQuantity, setSellQuantity] = useState(null);
  const [sellPrice, setSellPrice] = useState(null);
  const [sellIndex, setSellIndex] = useState(null);

  const getLocalCurr = () => {
    return localStorage.getItem("currency").substring(0, 3);
  };

  const getSymbol = () => {
    return localStorage.getItem("currency").substring(3, 4);
  };

  function handlePortfolio(transHistoryCopy) {
    let coins = [];
    let quantity = [];
    let total_price = [];

    let docIndex = 0;
    let indexRemove = [];
    console.log(transHistoryCopy);
    transHistoryCopy.forEach((doc) => {
      //FIFO
      if (parseFloat(doc.quantity) < 0) {
        let absVal = Math.abs(parseFloat(doc.quantity));
        while (absVal > 0) {
          const index = transHistoryCopy.findIndex((i) => i.coin === doc.coin);
          const indexQuantity = parseFloat(transHistoryCopy[index]["quantity"]);
          if (indexQuantity > 0 && absVal >= indexQuantity) {
            // make sure doesnt compare to sell orders?
            //transHistoryCopy.splice(index, 1); //push index
            //docIndex -= 1;
            indexRemove.push(index);
            absVal -= indexQuantity;
            transHistoryCopy[index]["coin"] = "SOLD";
          } else if (indexQuantity > 0 && absVal < indexQuantity) {
            transHistoryCopy[index]["quantity"] =
              parseFloat(transHistoryCopy[index]["quantity"]) - absVal;
            absVal -= indexQuantity;
          }
        }
        //transHistoryCopy.splice(docIndex, 1);
        indexRemove.push(docIndex);
        transHistoryCopy[docIndex]["coin"] = "SELLORDER";
        //docIndex -= 2;
      }
      docIndex += 1;
      //DO ALL OF ABOVE IN SEPERATE FOREACH BEFORE THIS ONE?
    });
    console.log(transHistoryCopy);

    console.log(indexRemove);
    indexRemove = indexRemove.sort(function (x, y) {
      return x - y;
    });
    console.log(indexRemove);

    for (let i = indexRemove.length - 1; i >= 0; i--) {
      transHistoryCopy.splice(indexRemove[i], 1);
      console.log(transHistoryCopy);
    }

    transHistoryCopy.forEach((doc) => {
      if (coins.includes(doc.coin)) {
        //not working
        const i = coins.indexOf(doc.coin);
        quantity[i] += parseFloat(doc.quantity);
        total_price[i] += parseFloat(doc.price) * parseFloat(doc.quantity);
      } else {
        coins.push(doc.coin);
        quantity.push(parseFloat(doc.quantity));
        total_price.push(parseFloat(doc.price) * parseFloat(doc.quantity));
      }
    });
    setCoins(coins);
    setQuantity(quantity);
    setTotal_Price(total_price);
  }

  useEffect(() => {
    async function getData() {
      const res = await getDoc(doc(db, "crypto-accounts", authedUser.uid));
      return res.data(); // await?
    }

    async function getPort() {
      const res = await getDocs(
        collection(db, "crypto-accounts", authedUser.uid, "transactions")
      );
      return res;
    }

    async function getLatest(coinList) {
      const res = await axios.get(getLatestPrices(coinList, getLocalCurr()));
      return res;
    }

    async function fetchData() {
      await getData().then((res) => {
        setUserData(res);
      });
      await getPort().then((transactions) => {
        const transHistory = transactions.docs.map((data) => ({
          coin: data.id,
          ...data.data(),
        }));

        transHistory.sort(function (x, y) {
          // ------------------------------------------
          return new Date(x.time) - new Date(y.time);
        });

        console.log([...transHistory]);
        const transHistorycopy = [...transHistory];

        handlePortfolio(transHistorycopy);
      });

      const coinsString = coins1.join("%2C");
      console.log(coinsString);

      await getLatest(coinsString).then((res) => {
        let openPL = [];
        coins1.forEach((coin) => {
          const i = coins1.indexOf(coin);
          const profit =
            (res.data[coin][getLocalCurr()] - total_price1[i] / quantity1[i]) *
            quantity1[i];
          openPL.push(profit);
        });
        setLatestPrice(res.data);
        setOpenPL(openPL);
        setLoading(false);
      });
    }
    if (authedUser.uid && loading) {
      // IS THIS OK---------------------------
      fetchData();
    }
  });

  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setSellQuantity(0);
  };
  const handleShow = (i) => {
    setSellIndex(i);
    setShow(true);
  };

  useEffect(() => {
    if (sellQuantity) {
      setSellPrice(
        sellQuantity * latestPrice[coins1[sellIndex]][getLocalCurr()]
      ); //------------------------------------------------------
    } else {
      setSellPrice(0);
    }
  }, [sellQuantity]);

  const handleSell = async () => {
    const userData = (
      await getDoc(doc(db, "crypto-accounts", authedUser.uid))
    ).data();

    if (sellPrice === 0 || sellPrice < 0) {
      return alert("Please choose a quantity larger than 0.");
    }
    if (sellQuantity > quantity1[sellIndex]) {
      return alert("Not enough of this coin owned");
    }
    if (sellQuantity === 0 || sellQuantity < 0) {
      return alert("Please choose a quantity larger than 0.");
    }

    await getDocs(
      collection(db, "crypto-accounts", authedUser.uid, "transactions")
    )
      .then(async (transactions) => {
        const transactionId =
          1 +
          transactions.docs.map((data) => ({
            coin: data.id,
            ...data.data(),
          })).length;

        await setDoc(
          doc(
            db,
            "crypto-accounts",
            authedUser.uid,
            "transactions",
            transactionId.toString()
          ),
          {
            coin: coins1[sellIndex],
            quantity: -sellQuantity,
            price: latestPrice[coins1[sellIndex]][getLocalCurr()],
            time: Date(), //-------------
          }
        );
      })
      .then(async () => {
        await updateDoc(doc(db, "crypto-accounts", authedUser.uid), {
          balance: userData.balance + sellPrice,
        });
        return;
      })
      .catch((e) => {
        alert(e);
      });
    window.location.reload(false);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sell {coins1[sellIndex]}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container">
            <div className="row">
              <div className="col">Quantity</div>
              <div className="col">
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  id="quantity"
                  name="quantity"
                  onChange={(event) => {
                    setSellQuantity(event.target.value);
                  }}
                />
              </div>
            </div>

            <div className="row">
              <div className="col">Total ({getSymbol()})</div>
              <div className="col">
                <input className="form-control" value={sellPrice} disabled />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSell}>
            Sell
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="container">
        <div className="container">
          <h1>Portfolio</h1>
        </div>

        <div className="container">
          <div className="row">
            <div className="portfolio-balance">
              <h1>
                {getSymbol()}
                {userData.balance.toLocaleString("en-GB", {
                  maximumFractionDigits: 20,
                })}
              </h1>
              <h4 style={{ color: "green" }}>+3.05%</h4>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="portfolio-stats">
              <Table
                responsive
                className="coin-table"
                style={{ color: "white" }}
              >
                <thead>
                  <tr>
                    <th>Name </th>
                    <th>Quantity</th>
                    <th>Average Price</th>
                    <th>P/L ({getSymbol()})</th>
                    <th>P/L (%)</th>
                    <th>Sell</th>
                  </tr>
                </thead>
                <tbody>
                  {coins1.map((coin, i) => (
                    <tr className="tableRow" key={coins1[i]}>
                      <td onClick={() => navigate(`/${coins1[i]}`)}>
                        {coins1[i]}
                      </td>
                      <td>{quantity1[i]}</td>
                      <td>
                        {getSymbol()}
                        {(total_price1[i] / quantity1[i]).toLocaleString(
                          "en-GB",
                          {
                            maximumFractionDigits: 20,
                          }
                        )}
                      </td>
                      <td>
                        {getSymbol()}
                        {openPL1[i]}
                      </td>
                      <td
                        style={{
                          color:
                            (100 * (openPL1[i] / total_price1[i])).toFixed(2) <
                            0
                              ? "red"
                              : "green",
                        }}
                      >
                        {(100 * (openPL1[i] / total_price1[i])).toFixed(2)}%
                      </td>
                      <td>
                        <Button variant="primary" onClick={() => handleShow(i)}>
                          Sell
                        </Button>{" "}
                        {/*fixed infinite loop re renders*/}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="portfolio-chart">
              <h1>chart</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
