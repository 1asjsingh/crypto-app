import React, { useEffect, useState } from "react";
import { Col, Container, Row, Button, Alert } from "react-bootstrap";
import axios from "./axios";
import Candlestick from "./Candlestick";
import Loading from "./Loading";
import { getCandleChart } from "./requests.js";

function Game() {
  const coins = ["bitcoin", "ethereum", "binancecoin", "litecoin"];
  const [currentCoin, setCurrentCoin] = useState(
    coins[Math.floor(Math.random() * coins.length)]
  );
  const [score, setScore] = useState(0);
  const [candleData, setCandleData] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLocalCurr = () => {
    return localStorage.getItem("currency").substring(0, 3);
  };

  useEffect(() => {
    const getCandleData = async () => { // MAKE IT RETURN DATA ?
      await axios
        .get(getCandleChart(currentCoin, getLocalCurr(), 'max'))
        .then((res) => {
          const randomIndex = Math.floor(Math.random() * (res.data.length - 176));
          const randomWindow = res.data.slice(randomIndex, randomIndex + 175)
          setAnswer(randomWindow);
          setCandleData(randomWindow.slice(0, -7));

          setLoading(false);
          console.log(1);
        });
    };
    if (currentCoin !== null && answered == false) {
      //-----------------------------
      getCandleData()/*.then(() => {
        console.log(123)
      });*/
    }
  }, [score, answered]);

  const handleAnswer = (selected) => {
    setCandleData(answer);
    setCurrentCoin(coins[Math.floor(Math.random() * coins.length)]);
    setAnswered(true);
    const prevClose = answer[answer.length - 8][4]
    const prevOpen = answer[answer.length - 8][1]
    const currClose = answer[answer.length - 1][4]
    //const currOpen = answer[answer.length - 1][1]

    const constraint_range = Math.abs(prevOpen - prevClose) * 0.5
    console.log(constraint_range)

    //think of new way, if open inside previous but BIG MOVE up on close then?
    if (selected === 'L') {
      if (currClose < (prevClose - constraint_range)) {
        return setCorrect(true)
      }
      return setCorrect(false)
    }
    else if (selected === 'S') {
      console.log(Math.abs(prevClose - currClose))
      if (Math.abs(prevClose - currClose) <= constraint_range) {
        return setCorrect(true)
      }
      return setCorrect(false)
    }
    else if (selected === 'H') {
      if (currClose > prevClose + constraint_range) {
        return setCorrect(true)
      }
      return setCorrect(false)
    }

    console.log(2);
  };

  const handleNext = () => {
    setAnswered(false);
    if (correct) {
      setScore(score + 1);
    }
    else {
      setScore(0);
    }
    setCorrect(null);
    
  };

  if (loading) return <Loading />;

  return (
    <Container>
      <Row>
        <h1>Chart Game</h1>
        <h2 className="text-center">{currentCoin}</h2>
        <h2 className="text-center">Score: {score}</h2>
        {correct && <Alert variant='success' className='text-center'>Correct! Well done</Alert>}
        {correct === false &&<Alert variant='danger' className='text-center'>Wrong! Game Over</Alert>}
      </Row>
      <Row>
        <Candlestick
          currency={getLocalCurr()}
          coin={currentCoin}
          gameData={candleData}
        />
      </Row>
      {!answered && (
        <Row>
          <Col>
            <Button className="w-100" onClick={() => handleAnswer("L")}>Lower</Button>
          </Col>
          <Col>
            <Button className="w-100" onClick={() => handleAnswer("S")}>Sideways</Button>
          </Col>
          <Col>
            <Button className="w-100" onClick={() => handleAnswer("H")}>Higher</Button>
          </Col>
        </Row>
      )}
      {answered && <Button className="w-100" onClick={() => handleNext()}>Next</Button>}
    </Container>
  );
}

export default Game;
