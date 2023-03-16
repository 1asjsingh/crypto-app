import React, { useEffect, useState } from "react";
import "./Portfolio.css";
import { useAuthentication } from "../contexts/AuthenticationContext";
import Loading from "./Loading";
import axios from "./axios";
import expressAxios from "./expressAxios";
import { getCurrencies } from "./requests.js";
import { Table, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";

function Portfolio() {
  const { authedUser } = useAuthentication();
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [coins, setCoins] = useState([]);
  const [profitBalance, setProfitBalance] = useState([]);
  const [quantity, setQuantity] = useState([]);
  const [totalPrice, setTotalPrice] = useState([]);
  const [openPL, setOpenPL] = useState([]);
  const [latestPrice, setLatestPrice] = useState([]);

  const [sellQuantity, setSellQuantity] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
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
        const res = await expressAxios.get(`getUserData/${authedUser.uid}`);
        setUserData(res.data);

        let res2 = await axios.get(getCurrencies(getLocalCurr()));
        res2 = res2.data;

        let res3 = await expressAxios.get(
          `getPortfolio/${getLocalCurr()}/${authedUser.uid}`
        );
        res3 = res3.data;

        setCoins(res3.coins);
        setProfitBalance(res3.balanceIncProfits);
        setQuantity(res3.quantity);
        setTotalPrice(res3.totalPrice);
        setLatestPrice(res2);
        setOpenPL(res3.openPL);

        setLoading(false);
      } catch (e) {
        if (e.response) {
          console.error(e);
        }
        if (e.request) {
          if (e.code === "ERR_NETWORK") {
            alert("CoinGecko request limit reached. Please wait 1-2 minutes.");
          } else {
            console.error(e);
          }
        } else {
          console.error(e);
        }
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

  //useEffect(() => {
  function handleSellQuantity(e) {
    const quant = Number(Number(e.target.value).toFixed(2));
    setSellQuantity(quant);
    if (quant > 0) {
      setSellPrice(
        quant *
          latestPrice.find(({ id }) => id === coins[sellIndex]).current_price
      ); //------------------------------------------------------
    } else {
      setSellPrice(0);
    }
  }
  //}, [sellQuantity, latestPrice, coins, sellIndex]);

  const handleSell = async () => {
    if (sellPrice === 0 || sellPrice < 0) {
      return alert("Please choose a quantity larger than 0");
    }
    if (sellQuantity > quantity[sellIndex]) {
      return alert("Not enough of this coin owned");
    }
    if (sellQuantity === 0 || sellQuantity < 0) {
      return alert("Please choose a quantity larger than 0.");
    }

    try {
      const current_price = latestPrice.find(
        ({ id }) => id === coins[sellIndex]
      ).current_price;

      const reqBody = {
        id: authedUser.uid,
        coin: coins[sellIndex],
        quantity: sellQuantity,
        current_price: current_price,
        sellPrice: sellPrice,
      };

      let sell = await expressAxios.post(`sell`, reqBody);
      console.log(sell);
    } catch (e) {}

    window.location.reload(false);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            Sell{" "}
            {coins[sellIndex] &&
              latestPrice.find(({ id }) => id === coins[sellIndex]).name}
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
                  onChange={(e) => {
                    handleSellQuantity(e);
                  }}
                />
              </Col>
            </Row>

            <Row>
              <Col>Total ({getSymbol()})</Col>
              <Col>
                <input
                  className="form-control"
                  value={sellPrice.toFixed(2)}
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <p>
                Order: SELL {sellQuantity} for {getSymbol()}
                {sellPrice.toFixed(2)}
              </p>
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
            <h5>Hi, {userData.username}</h5>
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
                {coins.map((coin, i) => (
                  <tr className="tableRow" key={`${coins[i]}_${Date.now()}`}>
                    <td onClick={() => navigate(`/${coins[i]}`)}>
                      <img
                        style={{ objectFit: "contain", height: "50px" }}
                        src={
                          latestPrice.find(({ id }) => id === coins[i]).image
                        }
                        alt="currency icon"
                      />
                    </td>
                    <td onClick={() => navigate(`/${coins[i]}`)}>
                      {latestPrice.find(({ id }) => id === coins[i]).name}
                    </td>
                    <td onClick={() => navigate(`/${coins[i]}`)}>
                      {quantity[i]}
                    </td>
                    <td onClick={() => navigate(`/${coins[i]}`)}>
                      {getSymbol()}
                      {totalPrice[i].toFixed(2)}
                    </td>
                    <td onClick={() => navigate(`/${coins[i]}`)}>
                      {getSymbol()}
                      {(totalPrice[i] / quantity[i]).toFixed(2)}
                    </td>
                    <td onClick={() => navigate(`/${coins[i]}`)}>
                      {getSymbol()}
                      {openPL[i].toFixed(2)}
                    </td>
                    <td
                      onClick={() => navigate(`/${coins[i]}`)}
                      style={{
                        color:
                          100 * (openPL[i] / totalPrice[i]) < 0
                            ? "red"
                            : "green",
                      }}
                    >
                      {(100 * (openPL[i] / totalPrice[i])).toFixed(2)}%
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
