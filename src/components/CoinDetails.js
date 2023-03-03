import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "./axios";
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
import { Col, Row } from "react-bootstrap";
import Candlestick from "./Candlestick";

function CoinDetails() {
  const { authedUser } = useAuthentication();
  const { coin } = useParams();
  const [details, setDetails] = useState([]);
  const [quantity, setQuantity] = useState();
  const [cost, setCost] = useState(0);
  const [candleView, setCandleView] = useState(false);

  const getLocalCurr = () => {
    return localStorage.getItem("currency").substring(0, 3);
  };
  const getSymbol = () => {
    return localStorage.getItem("currency").substring(3, 4);
  };

  const switchChartView = () => {
    if (candleView) {
      setCandleView(false);
    } else {
      setCandleView(true);
    }
  }

  useEffect(() => {
    const getData = async () => {
      const request = await axios.get(getDetails(coin));
      setDetails(request.data);
      return request;
    };
    getData();
  }, [coin]);

  useEffect(() => {
    if (quantity && details) {
      setCost(quantity * details.market_data.current_price[getLocalCurr()]);
    } else {
      setCost(0);
    }
  }, [quantity, details]);

  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setQuantity(0);
  };
  const handleShow = () => setShow(true);

  const handleBuy = async () => {
    const userData = (
      await getDoc(doc(db, "crypto-accounts", authedUser.uid))
    ).data();

    if (cost > userData.balance) {
      return alert("Not Enough Funds");
    }
    if (cost === 0 || cost < 0) {
      return alert("Please choose a quantity larger than 0.");
    }

    await getDocs(
      collection(db, "crypto-accounts", authedUser.uid, "transactions")
    )
      .then(async (transactions) => {
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
              quantity: quantity,
              price: details.market_data.current_price[getLocalCurr()],
              time: Date(), //-------------
            }
          );
        }
      })
      .then(async () => {
        await updateDoc(doc(db, "crypto-accounts", authedUser.uid), {
          balance: userData.balance - cost,
        });
      })
      .catch((e) => {
        alert(e);
      });
    window.location.reload(false);
  };

  if (details.length === 0) return <Loading />;

  return (
    <div>
      <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
          <Modal.Title>Buy</Modal.Title>
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
                    setQuantity(event.target.value);
                  }}
                />
              </div>
            </div>

            <div className="row">
              <div className="col">Total ({getSymbol()})</div>
              <div className="col">
                <input className="form-control" value={cost} disabled />
              </div>
            </div>
          </div>
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

      <div className="container">
        <div className="info-top">
          <div className="coin-img">
            <img src={details.image.large} alt="currency icon" />
          </div>
          <div>
            <h1 className="coin-title">{details.name}</h1>
          </div>
          <div className="row">
            <div>
              <button
                type="button"
                onClick={handleShow}
                className="btn date-btn col"
              >
                Buy
              </button>
            </div>
          </div>
          <div className="row">
            <h2 className="coin-header-price col detail-card">
              {getSymbol()}
              {details.market_data.current_price[getLocalCurr()].toLocaleString(
                "en-GB",
                { maximumFractionDigits: 20 }
              )}
            </h2>
            <h2
              className="coin-header-change col detail-card"
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
              % (24H)
            </h2>
          </div>
        </div>
      </div>
      <div className="container">
      <Row>
        <Col>
          <Button
            variant="primary"
            onClick={switchChartView}
          >
            Switch View
          </Button>
        </Col>
      </Row>
        <div className="row">
          <div className="coin-chart col detail-card">
            {candleView ? <Candlestick currency={getLocalCurr()} coin={coin}/> :<Chart currency={getLocalCurr()} coin={coin} />}
          </div>
        </div>
        <div className="row">
          <div className="coin-info col detail-card">
            <p>
              <em>Price:</em> {getSymbol()}
              {details.market_data.current_price[getLocalCurr()].toLocaleString(
                "en-GB",
                { maximumFractionDigits: 20 }
              )}
            </p>
            <p>
              <em>All-Time High:</em> {getSymbol()}
              {details.market_data.ath[getLocalCurr()].toLocaleString("en-GB", {
                maximumFractionDigits: 20,
              })}
            </p>
            <p>
              <em>High (24H):</em> {getSymbol()}
              {details.market_data.high_24h[getLocalCurr()].toLocaleString(
                "en-GB",
                { maximumFractionDigits: 20 }
              )}
            </p>
            <p>
              <em>Low (24H):</em> {getSymbol()}
              {details.market_data.low_24h[getLocalCurr()].toLocaleString(
                "en-GB",
                { maximumFractionDigits: 20 }
              )}
            </p>
            <p>
              <em>Market Capitilisation:</em> {getSymbol()}
              {details.market_data.market_cap[getLocalCurr()].toLocaleString(
                "en-GB",
                { maximumFractionDigits: 20 }
              )}
            </p>
            <p>
              <em>Price Change (24H):</em>{" "}
              {details.market_data.price_change_percentage_24h_in_currency[
                getLocalCurr()
              ].toFixed(2)}
              %
            </p>
          </div>
          <div className="coin-description col detail-card">
            <div dangerouslySetInnerHTML={{ __html: details.description.en }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoinDetails;
