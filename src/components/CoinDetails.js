import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "./axios";
import predictionAxios from "./predictionAxios";
import Loading from "./Loading";
import { getDetails } from "./requests.js";
import Chart from "./Chart.js";
import "./CoinDetail.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useAuthentication } from "../contexts/AuthenticationContext";
import { db } from "../components/firebase";
import {
  getDocs,
  getDoc,
  setDoc,
  collection,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Col, Container, Row } from "react-bootstrap";
import Candlestick from "./Candlestick";
import { TbChartCandle } from "react-icons/tb";
import { AiOutlineLineChart } from "react-icons/ai";
import numeral from "numeral";

function CoinDetails() {
  const { authedUser } = useAuthentication();
  const { coin } = useParams();
  const [details, setDetails] = useState([]);
  const [predictedVals, setPredictedVals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState();
  const [cost, setCost] = useState(0);
  const [candleView, setCandleView] = useState(
    localStorage.getItem("chartView") || "l"
  );
  const navigate = useNavigate();

  const predictedCoins = useCallback(() => {
    return ["bitcoin", "ethereum", "dogecoin", "tether", "ripple"];
  }, []);

  const numeralise = (num) => {
    const converted = numeral(num).format("0.0a");
    return converted.slice(0, -1) + converted.slice(-1).toUpperCase();
  };

  const getLocalCurr = () => {
    return localStorage.getItem("currency").substring(0, 3);
  };
  const getSymbol = () => {
    return localStorage.getItem("currency").substring(3, 4);
  };

  const switchChartView = () => {
    if (candleView === "c") {
      setCandleView("l");
    } else {
      setCandleView("c");
    }
  };

  useEffect(() => {
    async function getData() {
      try {
        const request = await axios.get(getDetails(coin));
        setDetails(request.data);

        if (predictedCoins().includes(coin)) {
          getPrediction(request.data.symbol.toUpperCase());
        }

        setLoading(false);
        return request;
      } catch (e) {
        if (e.response) {
          if (e.response.status === 404) {
            navigate("/notfound");
            return;
          } else {
            console.error(e);
          }
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

    async function getPrediction(symbol) {
      try {
        const predRes = await predictionAxios.get(
          `/predict/${symbol}/${getLocalCurr().toUpperCase()}`
        );
        setPredictedVals(predRes.data);
      } catch (e) {
        if (e.response) {
          if (e.response.status === 500) {
            alert("Unsupported coin for prediction");
          } else {
            console.error(e);
          }
        }
        if (e.request) {
          if (e.code === "ERR_NETWORK") {
            alert("Prediction server is offline");
          } else {
            console.error(e);
          }
        } else {
          console.error(e);
        }
      }
    }
    getData();
  }, [coin, navigate, predictedCoins]); //navigate ----------------------------------------------------

  function handleBuyQuantity(e) {
    const quant = Number(Number(e.target.value).toFixed(2));
    setQuantity(quant);
    if (quant > 0) {
      setCost(quant * details.market_data.current_price[getLocalCurr()]);
    } else {
      setCost(0);
    }
  }

  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setQuantity(0);
  };
  const handleShow = () => setShow(true);

  const handleBuy = async () => {
    try {
      const userData = (
        await getDoc(doc(db, "crypto-accounts", authedUser.uid))
      ).data();

      if (cost > userData.balance) {
        return alert("Not Enough Funds");
      }
      if (cost === 0 || cost < 0.01) {
        return alert("Please choose a total cost larger than 0.01");
      }

      const transactions = await getDocs(
        collection(db, "crypto-accounts", authedUser.uid, "transactions")
      );
      if (transactions.empty) {
        await setDoc(
          doc(db, "crypto-accounts", authedUser.uid, "transactions", "1"),
          {
            coin: coin,
            quantity: parseFloat(quantity),
            price: details.market_data.current_price[getLocalCurr()],
            time: Date(), //-------------
          }
        );
      } else {
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
            coin: coin,
            quantity: parseFloat(quantity),
            price: details.market_data.current_price[getLocalCurr()],
            time: Date(), //-------------
          }
        );
      }
      await updateDoc(doc(db, "crypto-accounts", authedUser.uid), {
        balance: userData.balance - cost,
      });

      window.location.reload(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Buy</Modal.Title>
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
                    handleBuyQuantity(e);
                  }}
                />
              </Col>
            </Row>

            <Row>
              <Col>Total ({getSymbol()})</Col>
              <Col>
                <input
                  className="form-control"
                  value={cost.toFixed(2)}
                  disabled
                />
              </Col>
            </Row>
            <Row>
              <p>
                Order: BUY {quantity} for {getSymbol()}
                {cost.toFixed(2)}
              </p>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleBuy}>
            Buy
          </Button>
        </Modal.Footer>
      </Modal>

      <Container className="info-top">
        <div className="coin-img">
          <img src={details.image.large} alt="currency icon" />
        </div>
        <div>
          <h1 className="coin-title m-auto">{details.name}</h1>
        </div>
        <Row>
          <div>
            <Button variant="primary" onClick={handleShow}>
              Buy
            </Button>
          </div>
        </Row>
        <Row>
          <Col className="round-box justify-content-center">
            <h2 className="">
              {getSymbol()}
              {details.market_data.current_price[getLocalCurr()].toLocaleString(
                "en-GB",
                { maximumFractionDigits: 20 }
              )}
            </h2>
          </Col>
          <Col className="round-box">
            <h2
              style={{
                color:
                  details.market_data.price_change_percentage_24h_in_currency[
                    getLocalCurr()
                  ] < 0
                    ? "red"
                    : "green",
              }}
            >
              {details.market_data.price_change_percentage_24h_in_currency[
                getLocalCurr()
              ].toFixed(2)}
              %
            </h2>
          </Col>
        </Row>
      </Container>
      <Container>
        <Row>
          <Col className="d-flex justify-content-center">
            <Button variant="primary" onClick={switchChartView}>
              {candleView ? <AiOutlineLineChart /> : <TbChartCandle />}
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xl="9" lg="12" md="12" className="coin-chart round-box">
            {candleView === "c" ? (
              <Candlestick currency={getLocalCurr()} coin={coin} />
            ) : (
              <Chart currency={getLocalCurr()} coin={coin} />
            )}
          </Col>
          <Col className="coin-info round-box">
            <p>
              <em>Price:</em> {getSymbol()}
              {details.market_data.current_price[getLocalCurr()].toLocaleString(
                "en-GB",
                { maximumFractionDigits: 20 }
              )}
            </p>
            <hr />
            <p
              style={{
                color:
                  details.market_data.price_change_percentage_1h_in_currency[
                    getLocalCurr()
                  ] < 0
                    ? "red"
                    : "green",
              }}
            >
              <em>Change (1H):</em>{" "}
              {details.market_data.price_change_percentage_1h_in_currency[
                getLocalCurr()
              ].toFixed(2)}
              %
            </p>
            <hr />
            <p
              style={{
                color:
                  details.market_data.price_change_percentage_24h_in_currency[
                    getLocalCurr()
                  ] < 0
                    ? "red"
                    : "green",
              }}
            >
              <em>Change (24H):</em>{" "}
              {details.market_data.price_change_percentage_24h_in_currency[
                getLocalCurr()
              ].toFixed(2)}
              %
            </p>
            <hr />
            <p
              style={{
                color:
                  details.market_data.price_change_percentage_7d_in_currency[
                    getLocalCurr()
                  ] < 0
                    ? "red"
                    : "green",
              }}
            >
              <em>Change (7D):</em>{" "}
              {details.market_data.price_change_percentage_7d_in_currency[
                getLocalCurr()
              ].toFixed(2)}
              %
            </p>
            <hr />
            <p>
              <em>All-Time High:</em> {getSymbol()}
              {details.market_data.ath[getLocalCurr()].toLocaleString("en-GB", {
                maximumFractionDigits: 20,
              })}
            </p>
            <hr />
            <p>
              <em>High (24H):</em> {getSymbol()}
              {details.market_data.high_24h[getLocalCurr()].toLocaleString(
                "en-GB",
                { maximumFractionDigits: 20 }
              )}
            </p>
            <hr />
            <p>
              <em>Low (24H):</em> {getSymbol()}
              {details.market_data.low_24h[getLocalCurr()].toLocaleString(
                "en-GB",
                { maximumFractionDigits: 20 }
              )}
            </p>
            <hr />
            <p>
              <em>Trading Volume:</em> {getSymbol()}
              {numeralise(details.market_data.total_volume[getLocalCurr()])}
            </p>
            <hr />
            <p>
              <em>Market Cap:</em> {getSymbol()}
              {numeralise(details.market_data.market_cap[getLocalCurr()])}
            </p>
            <hr />
            <p>
              <em>Circulating Supply: </em>
              {numeralise(details.market_data.circulating_supply)}{" "}
              {details.symbol.toUpperCase()}
            </p>
          </Col>
        </Row>
        {details.description.en.length > 2 && (
          <Row className="coin-description round-box">
            <div dangerouslySetInnerHTML={{ __html: details.description.en }} />
          </Row>
        )}

        {predictedCoins().includes(coin) && predictedVals.length > 0 && (
          <Row className="coin-chart round-box">
            <h3>Prediction</h3>
            <p>Disclaimer: This is a prediction and not financial advice</p>
            <Chart
              currency={getLocalCurr()}
              coin={coin}
              prediction={predictedVals}
            />
          </Row>
        )}
      </Container>
    </div>
  );
}

export default CoinDetails;
