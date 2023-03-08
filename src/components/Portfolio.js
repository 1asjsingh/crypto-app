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
import { Table, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";

function Portfolio() {
  const { authedUser } = useAuthentication();
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [coins1, setCoins] = useState([]);
  const [profitBalance, setProfitBalance] = useState([]);
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

        let coins = [];
        let quantity = [];
        let total_price = [];
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
                transHistory[index]["quantity"] =
                  parseFloat(transHistory[index]["quantity"]) - absVal; //FLOATING POINT ERROR FIX
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

        let res2 = await axios.get(getCurrencies(getLocalCurr()));
        res2 = res2.data;

        transHistory.forEach((doc) => {
          const current_price = res2.find(
            ({ id }) => id === doc.coin
          ).current_price;
          if (coins.includes(doc.coin)) {
            //not working
            const i = coins.indexOf(doc.coin);
            quantity[i] += parseFloat(doc.quantity);
            total_price[i] += parseFloat(doc.price) * parseFloat(doc.quantity); // total BUY price not current
            openPL[i] += current_price * parseFloat(doc.quantity);
          } else {
            coins.push(doc.coin);
            quantity.push(parseFloat(doc.quantity));
            total_price.push(parseFloat(doc.price) * parseFloat(doc.quantity));
            openPL.push(current_price * parseFloat(doc.quantity));
          }
        });

        let profits = 0;
        coins.forEach(function (coin, i) {
          profits += openPL[i] - total_price[i];
        });

        const total_price_sum = total_price.reduce((sum, x) => {
          return sum + x;
        });

        setCoins(coins);
        setProfitBalance(res.data().balance + total_price_sum + profits);
        setQuantity(quantity);
        setTotal_Price(total_price);
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
        sellQuantity *
          latestPrice.find(({ id }) => id === coins1[sellIndex]).current_price
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
      return alert("Please choose a quantity larger than 0");
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
            quantity: -parseFloat(sellQuantity),
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
          <Modal.Title>
            Sell{" "}
            {coins1[sellIndex] &&
              latestPrice.find(({ id }) => id === coins1[sellIndex]).name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col>Quantity</Col>
              <Col>
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
              </Col>
            </Row>

            <Row>
              <Col>Total ({getSymbol()})</Col>
              <Col>
                <input className="form-control" value={sellPrice} disabled />
              </Col>
            </Row>
          </Container>
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
      <Container>
        <Container>
          <h1>Portfolio</h1>
        </Container>

        <Container>
          <Row className="portfolio-balance">
            <h1>
              {getSymbol()}
              {profitBalance.toFixed(2)}
            </h1>
            <h4 style={{ color: "#a9a9a9" }}>
              Available: {getSymbol()}
              {userData.balance.toFixed(2)}
            </h4>
            <h4
              style={{
                color:
                  100 * ((profitBalance - 100000) / 100000) < 0
                    ? "red"
                    : "green",
              }}
            >
              {(100 * ((profitBalance - 100000) / 100000)).toFixed(2)}%
            </h4>
          </Row>
        </Container>
        <Container>
          <Row className="portfolio-stats">
            <Table responsive className="coin-table" style={{ color: "white" }}>
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Holdings</th>
                  <th>Average Price</th>
                  <th>P/L ({getSymbol()})</th>
                  <th>P/L (%)</th>
                  <th>Sell</th>
                </tr>
              </thead>
              <tbody>
                {coins1.map((coin, i) => (
                  <tr className="tableRow" key={`${coins1[i]}_${Date.now()}`}>
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
                      {total_price1[i].toFixed(2)}
                    </td>
                    <td onClick={() => navigate(`/${coins1[i]}`)}>
                      {getSymbol()}
                      {(total_price1[i] / quantity1[i]).toFixed(2)}
                    </td>
                    <td onClick={() => navigate(`/${coins1[i]}`)}>
                      {getSymbol()}
                      {(openPL1[i] - total_price1[i]).toFixed(2)}
                    </td>
                    <td
                      onClick={() => navigate(`/${coins1[i]}`)}
                      style={{
                        color:
                          100 *
                            ((openPL1[i] - total_price1[i]) / total_price1[i]) <
                          0
                            ? "red"
                            : "green",
                      }}
                    >
                      {(
                        100 *
                        ((openPL1[i] - total_price1[i]) / total_price1[i])
                      ).toFixed(2)}
                      %
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
          </Row>
        </Container>
      </Container>
    </div>
  );
}

export default Portfolio;
