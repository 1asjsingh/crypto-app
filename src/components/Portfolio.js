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
import { getCurrencies } from "./requests.js";
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

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getDoc(doc(db, "crypto-accounts", authedUser.uid));
        setUserData(res.data());

        const transactions = await getDocs(
          collection(db, "crypto-accounts", authedUser.uid, "transactions")
        );

        let transHistory = transactions.docs.map((data) => ({
          coin: data.id,
          ...data.data(),
        }));

        transHistory.sort(function (x, y) {
          return new Date(x.time) - new Date(y.time);
        });

        console.log(transHistory);
        //const transHistory = [...transHistory];

        let coins = [];
        let quantity = [];
        let total_price = [];

        let docIndex = 0;
        let indexRemove = [];
        console.log(transHistory);
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
          console.log(doc.quantity * doc.price);
          if (coins.includes(doc.coin)) {
            //not working
            const i = coins.indexOf(doc.coin);
            quantity[i] += parseFloat(doc.quantity);
            total_price[i] += parseFloat(doc.price) * parseFloat(doc.quantity); // total BUY price not current
          } else {
            coins.push(doc.coin);
            quantity.push(parseFloat(doc.quantity));
            total_price.push(parseFloat(doc.price) * parseFloat(doc.quantity));
          }
        });
        setCoins(coins);
        setQuantity(quantity);
        setTotal_Price(total_price);

        let res2 = await axios.get(getCurrencies(getLocalCurr()));
        res2 = res2.data;

        let openPL = [];
        coins.forEach((coin) => {
          const i = coins.indexOf(coin);
          const current_price = res2.find(
            ({ id }) => id === coin
          ).current_price;
          const profit = (
            (current_price - total_price[i] / quantity[i]) *
            quantity[i]
          ).toFixed(2);
          console.log(profit);
          openPL.push(profit);
        });

        setLatestPrice(res2);
        setOpenPL(openPL);
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    }

    fetchData();
  }, [authedUser]);

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
        (
          sellQuantity *
          latestPrice.find(({ id }) => id === coins1[sellIndex]).current_price
        ).toFixed(2)
      ); //------------------------------------------------------
    } else {
      setSellPrice(0);
    }
  }, [sellQuantity]);

  const handleSell = async () => {
    const userData = (
      await getDoc(doc(db, "crypto-accounts", authedUser.uid))
    ).data();

    if (sellPrice === 0 || sellPrice < 0.01) {
      return alert("Please choose a quantity larger than 0.01");
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
            quantity: parseFloat(-sellQuantity),
            price: latestPrice.find(({ id }) => id === coins1[sellIndex])
              .current_price,
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
              <h1>{getSymbol()}</h1>
              <h3>
                Available: {getSymbol()}
                {userData.balance.toLocaleString("en-GB", {
                  maximumFractionDigits: 20,
                })}
              </h3>
              <h4
                style={{
                  color:
                    100 * ((userData.balance - 100000) / 100000) < 0
                      ? "red"
                      : "green",
                }}
              >
                {(100 * ((userData.balance - 100000) / 100000)).toFixed(2)}%
              </h4>
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
                    <th>Icon</th>
                    <th>Name</th>
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
                        <img
                          style={{ objectFit: "contain", height: "50px" }}
                          src={
                            latestPrice.find(({ id }) => id === coins1[i]).image
                          }
                          alt="currency icon"
                        />
                      </td>
                      <td onClick={() => navigate(`/${coins1[i]}`)}>
                        {latestPrice.find(({ id }) => id === coins1[i]).name}
                      </td>
                      <td onClick={() => navigate(`/${coins1[i]}`)}>
                        {quantity1[i]}
                      </td>
                      <td onClick={() => navigate(`/${coins1[i]}`)}>
                        {getSymbol()}
                        {(total_price1[i] / quantity1[i]).toLocaleString(
                          "en-GB",
                          {
                            maximumFractionDigits: 20,
                          }
                        )}
                      </td>
                      <td onClick={() => navigate(`/${coins1[i]}`)}>
                        {getSymbol()}
                        {openPL1[i]}
                      </td>
                      <td
                        onClick={() => navigate(`/${coins1[i]}`)}
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
      </div>
    </div>
  );
}

export default Portfolio;
