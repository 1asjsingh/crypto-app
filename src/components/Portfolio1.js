import React, { useEffect, useState } from "react";
import "./Portfolio.css";
import { useAuthentication } from "../contexts/AuthenticationContext";
import { db } from "../components/firebase";
import { getDoc, getDocs, collection, doc } from "firebase/firestore";
import Loading from "./Loading";
import axios from "./axios";
import { getLatestPrices } from "./requests.js";
import { Table, Button } from "react-bootstrap";

function Portfolio() {
  const { authedUser } = useAuthentication();
  const [userData, setUserData] = useState([]);
  const [transHistory, setTransHistory] = useState([]);

  const getLocalCurr = () => {
    return localStorage.getItem("currency").substring(0, 3);
  };

  async function getData() {
    await getDoc(doc(db, "crypto-accounts", authedUser.uid))
      .then((data) => {
        setUserData(data.data());
      })
      .catch((e) => {
        alert(e);
      });
  }

  async function getPort() {
    await getDocs(
      collection(db, "crypto-accounts", authedUser.uid, "transactions")
    )
      .then((transactions) => {
        const tHist = transactions.docs.map((data) => ({
          coin: data.id,
          ...data.data(),
        }));
        setTransHistory(tHist);
      })
      .catch((e) => {
        alert(e);
      });
  }

  useEffect(() => {
    if (authedUser.uid) {
      getData();
      getPort();
    }
  }, [authedUser]);

  let coins = [];
  let quantity = [];
  let total_price = [];
  let openPL = [];

  async function getLatest(coinList) {
    await axios.get(getLatestPrices(coinList, getLocalCurr())).then((res) => {
      coins.forEach((coin) => {
        const i = coins.indexOf(coin);
        const profit =
          total_price[i] / quantity[i] -
          res.data[coin][getLocalCurr()];
        openPL.push(profit);
      });
      console.log(openPL);
    });
  }
  transHistory.forEach((doc) => {
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

  const coinsString = coins.join("%2C");
  getLatest(coinsString);

  if (userData.length === 0 && transHistory.length === 0) return <Loading />;

  return (
    <div className="container">
      <div className="container">
        <h1>Portfolio</h1>
      </div>

      <div className="container">
        <div className="row">
          <div className="portfolio-balance">
            <h1>
              {localStorage.getItem("currency").substring(3, 4)}
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
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>P/L</th>
                    <th>Sell</th>
                  </tr>
                </thead>
                <tbody>
                  {coins.map((coin, i) => (
                    <tr className="tableRow" key={coins[i]}>
                      <td>{coins[i]}</td>
                      <td>
                        {localStorage.getItem("currency").substring(3, 4)}
                        {total_price[i].toLocaleString("en-GB", {
                          maximumFractionDigits: 20,
                        })}
                      </td>
                      <td>{quantity[i]}</td>
                      <td>{openPL[i]}</td>
                      <td>
                        <Button variant="primary">Sell</Button>
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
  );
}

export default Portfolio;
