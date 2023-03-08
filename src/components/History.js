import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { getDocs, collection } from "firebase/firestore";
import Loading from "./Loading";
import { getCurrencies } from "./requests.js";
import { useAuthentication } from "../contexts/AuthenticationContext";
import { Container, Row, Table } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function History() {
  const { authedUser } = useAuthentication();
  const [transactions, setTransactions] = useState(null);
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getSymbol = () => {
    return localStorage.getItem("currency").substring(3, 4);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const transactions = await getDocs(
          collection(db, "crypto-accounts", authedUser.uid, "transactions")
        );

        const coins = await axios.get(
          getCurrencies(localStorage.getItem("currency").substring(0, 3))
        );

        let transHistory = transactions.docs.map((data) => ({
          coin: data.id,
          ...data.data(),
        }));

        transHistory.sort(function (x, y) {
          return new Date(y.time) - new Date(x.time);
        });

        setTransactions(transHistory);
        setCoinData(coins.data);
        setLoading(false);
      } catch (e) {
        alert(e);
      }
    }

    fetchData();
  }, [authedUser]);

  if (loading) return <Loading />;

  return (
    <Container>
      <Container>
        <h1>History</h1>
      </Container>

      <Row className="round-box">
        <Table responsive className="coin-table" style={{ color: "white" }}>
          <thead>
            <tr className="text-center">
              <th>Icon</th>
              <th>Coin</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.time}
                className="text-center"
                onClick={() => navigate(`/${transaction.coin}`)}
              >
                <td>
                  <img
                    style={{ objectFit: "contain", height: "50px" }}
                    src={
                      coinData.find(({ id }) => id === transaction.coin).image
                    }
                    alt="currency icon"
                  />
                </td>
                <td>
                  {coinData.find(({ id }) => id === transaction.coin).name}
                </td>
                <td>
                  {parseFloat(transaction.quantity).toLocaleString("en-GB", {
                    maximumFractionDigits: 20,
                  })}
                </td>
                <td>
                  {getSymbol()}
                  {transaction.price.toLocaleString("en-GB", {
                    maximumFractionDigits: 20,
                  })}
                </td>
                <td>{new Date(transaction.time).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
    </Container>
  );
}

export default History;
