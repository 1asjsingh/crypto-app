import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Container, Row, Table } from "react-bootstrap";
import { db } from "./firebase";
import Loading from "./Loading";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const getLocalCurr = () => {
    return localStorage.getItem("currency");
  };

  const getLocalSymbol = () => {
    return localStorage.getItem("currency").substring(3, 4);
  };

  useEffect(() => {
    async function getLeaderboard() {
      try {
        const plRes = await getDocs(
          query(
            collection(db, "crypto-leaderboard"),
            where("currency", "==", getLocalCurr())
          )
        );

        let pl = plRes.docs.map((data) => ({
          ...data.data(),
        }));

        pl.sort(function (x, y) {
          return y.score - x.score;
        });

        let plFiltered = pl.filter((curr) => {
          return curr.PL !== 0;
        });

        setLeaderboard(plFiltered.slice(0, 10));

        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    }
    getLeaderboard();
  }, []);

  if (loading) return <Loading />;

  return (
    <Container>
      <Row>
        <h1>Leaderboard</h1>
      </Row>
      <Row>
        <Table responsive className="coin-table" style={{ color: "white" }}>
          <thead>
            <tr className="text-center">
              <th>Player</th>
              <th>P/L</th>
              <th>P/L (%)</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((score) => (
              <tr className="text-center" key={score.username}>
                <td>{score.username}</td>
                <td>
                  {getLocalSymbol()}
                  {score.PL}
                </td>
                <td
                  style={{
                    color: 100 * (score.PL / 100000) < 0 ? "red" : "green",
                  }}
                >
                  {(100 * (score.PL / 100000)).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
    </Container>
  );
}

export default Leaderboard;
