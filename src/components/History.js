import React, { useState, useEffect } from "react";
import Loading from "./Loading";
import { useAuthentication } from "../contexts/AuthenticationContext";
import { Container, Row, Table } from "react-bootstrap";
import expressAxios from "./expressAxios";
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

  const getCurr = () => {
    return localStorage.getItem("currency").substring(0, 3);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        let transactions = await expressAxios.get(
          `portfolio/getHistory/${authedUser.uid}`
        );
        transactions = transactions.data;

        const coins = await expressAxios.get(`api/getCurrencies/${getCurr()}`);

        setTransactions(transactions);
        setCoinData(coins.data);
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

  if (loading) return <Loading />;

  return (
    <Container>
      <Container>
        <h1>History</h1>
      </Container>

      <Row className="round-box">
        <Table
          striped
          responsive
          className="coin-table"
          style={{ color: "white" }}
        >
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
