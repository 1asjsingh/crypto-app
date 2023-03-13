import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { Col, Container, Row, Button, Alert, Table } from "react-bootstrap";
import axios from "./axios";
import Candlestick from "./Candlestick";
import { db } from "./firebase";
import Loading from "./Loading";
import { getCandleChart } from "./requests.js";
import { useAuthentication } from "../contexts/AuthenticationContext";

function Game() {
  const coins = useCallback(() => {
    return ["bitcoin", "ethereum", "binancecoin", "litecoin"];
  }, []);
  const displayNames = useCallback(() => {
    return ["Bitcoin", "Ethereum", "BNB", "Litecoin"];
  }, []); //reduce api calls
  const initialIndex = Math.floor(Math.random() * coins.length);
  const [currentCoin, setCurrentCoin] = useState(coins[initialIndex]);
  const [currentDisplay, setCurrentDisplay] = useState(
    displayNames()[initialIndex]
  );
  const [score, setScore] = useState(0);
  const { authedUser } = useAuthentication();
  const [candleData, setCandleData] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [highScores, setHighScores] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLocalCurr = () => {
    return localStorage.getItem("currency").substring(0, 3);
  };

  useEffect(() => {
    const getCandleData = async (coin) => {
      try {
        const res = await axios.get(
          getCandleChart(coin, getLocalCurr(), "max")
        );
        const randomIndex = Math.floor(Math.random() * (res.data.length - 176));
        const randomWindow = res.data.slice(randomIndex, randomIndex + 175);
        setAnswer(randomWindow);
        setCandleData(randomWindow.slice(0, -7));

        const scoresRes = await getDocs(
          query(collection(db, "crypto-leaderboard"), where("score", ">", 0))
        );

        let scores = scoresRes.docs.map((data) => ({
          ...data.data(),
        }));

        scores.sort(function (x, y) {
          return y.score - x.score;
        });

        setHighScores(scores.slice(0, 10));

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
    };
    if (answered === false) {
      const i = Math.floor(Math.random() * coins().length);
      setCurrentCoin(coins()[i]);
      setCurrentDisplay(displayNames()[i]);
      getCandleData(coins()[i]);
    }
  }, [score, answered, coins, displayNames]);

  const handleAnswer = (selected) => {
    setCandleData(answer);
    setAnswered(true);
    const prevClose = answer[answer.length - 8][4];
    const prevOpen = answer[answer.length - 8][1];
    const currClose = answer[answer.length - 1][4];
    //const currOpen = answer[answer.length - 1][1]

    const constraint_range = Math.abs(prevOpen - prevClose); // * 0.5;
    let correct;

    if (Math.abs(prevClose - currClose) <= constraint_range) {
      correct = "S";
      setFeedback("(Answer: Sideways)");
    }
    if (currClose < prevClose - constraint_range) {
      correct = "L";
      setFeedback("(Answer: Lower)");
    }
    if (currClose > prevClose + constraint_range) {
      correct = "H";
      setFeedback("(Answer: Higher)");
    }

    //think of new way, if open inside previous but BIG MOVE up on close then?
    if (selected === "S" && correct === "S") {
      return setCorrect(true);
    } else if (selected === "L" && correct === "L") {
      return setCorrect(true);
    } else if (selected === "H" && correct === "H") {
      return setCorrect(true);
    } else {
      return setCorrect(false);
    }
  };

  const handleNext = () => {
    setAnswered(false);
    if (correct) {
      setScore(score + 1);
    } else {
      handleHighScore(score);
      setScore(0);
    }
    setCorrect(null);
  };

  async function handleHighScore(currScore) {
    try {
      let res = await getDoc(doc(db, "crypto-leaderboard", authedUser.uid));
      res = res.data();

      if (parseInt(res.score) < currScore) {
        await updateDoc(doc(db, "crypto-leaderboard", authedUser.uid), {
          score: currScore,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  if (loading) return <Loading />;

  return (
    <Container>
      <Row>
        <h1>Chart Game</h1>
        <h6>Guess the closing price of the candle 7 candles ahead</h6>
        <h2 className="text-center">{currentDisplay}</h2>
        <h2 className="text-center">Score: {score}</h2>
      </Row>
      {correct && (
        <Row>
          <Alert variant="success" className="text-center">
            Correct! Well done
          </Alert>
        </Row>
      )}
      {correct === false && (
        <Row>
          <Alert variant="danger" className="text-center">
            Wrong! Game Over {feedback}
          </Alert>
        </Row>
      )}

      <Row className="round-box">
        <Candlestick
          currency={getLocalCurr()}
          coin={currentCoin}
          gameData={candleData}
        />
      </Row>
      {!answered && (
        <Row className="round-box">
          <Col>
            <Button className="w-100" onClick={() => handleAnswer("L")}>
              Lower
            </Button>
          </Col>
          <Col>
            <Button className="w-100" onClick={() => handleAnswer("S")}>
              Sideways
            </Button>
          </Col>
          <Col>
            <Button className="w-100" onClick={() => handleAnswer("H")}>
              Higher
            </Button>
          </Col>
        </Row>
      )}
      {answered && (
        <Row className="round-box">
          <Button className="w-100" onClick={() => handleNext()}>
            Next
          </Button>
        </Row>
      )}
      <Row>
        <h2>Leaderboard</h2>
      </Row>
      <Row className="round-box">
        <Table
          striped
          responsive
          className="coin-table"
          style={{ color: "white" }}
        >
          <thead>
            <tr className="text-center">
              <th>#</th>
              <th>Player</th>
              <th>High Score</th>
            </tr>
          </thead>
          <tbody>
            {highScores.map((score, i) => (
              <tr className="text-center" key={score.username}>
                <td>{i + 1}</td>
                <td>{score.username}</td>
                <td>{score.score}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
    </Container>
  );
}

export default Game;
