import React, { useState, useEffect } from "react";
import axios from "./axios";
import ReactApexChart from "react-apexcharts";
import { getCandleChart } from "./requests.js";
import Loading from "./Loading";
import "./Candlestick.css";
import { Button, Col, Container, Row } from "react-bootstrap";

function Candlestick({ currency, coin, gameData }) {
  const [candleData, setCandleData] = useState([]);
  const [loading, setLoading] = useState(true);
  let [range, setRange] = useState(1);

  useEffect(() => {
    async function getCandleData() {
      try {
        const res = await axios.get(getCandleChart(coin, currency, range));
        setCandleData(res.data);
        setLoading(false);
      } catch (e) {
        if (e.code === "ERR_NETWORK") {
          alert("CoinGecko request limit reached. Please wait 1-2 minutes.");
        } else {
          console.error(e);
        }
      }
    }
    if (!gameData) {
      getCandleData();
    } else {
      setCandleData(gameData);
      setLoading(false);
    }
  }, [coin, currency, range, gameData]);

  if (loading) return <Loading />;

  const seriesData = candleData.map((d) => {
    const candleDate = new Date(d[0]);
    const prices = d.slice(1, 5);
    return { x: candleDate, y: prices };
  });

  const series = [
    {
      data: seriesData,
    },
  ];
  const options = {
    chart: {
      type: "candlestick",
      height: 350,
      toolbar: {
        tools: {
          download: false,
          pan: true,
        },
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "white",
        },
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        style: {
          colors: "white",
        },
      },
    },
    tooltip: {
      fillSeriesColor: true,
    },
    grid: {
      borderColor: "#202020",
    },
  };
  return (
    <Container>
      {!gameData && (
        <Row>
          <Col>
            <Button className="w-100" onClick={() => setRange(1)}>
              1D
            </Button>
          </Col>
          <Col>
            <Button className="w-100" onClick={() => setRange(7)}>
              7D
            </Button>
          </Col>
          <Col>
            <Button className="w-100" onClick={() => setRange(30)}>
              1M
            </Button>
          </Col>
          <Col>
            <Button className="w-100" onClick={() => setRange(365)}>
              1Y
            </Button>
          </Col>
          <Col>
            <Button className="w-100" onClick={() => setRange("max")}>
              Max
            </Button>
          </Col>
        </Row>
      )}
      <div className="mt-4">
        <Row>
          <ReactApexChart
            options={options}
            series={series}
            type="candlestick"
            height={600}
          />
        </Row>
      </div>
    </Container>
  );
}

export default Candlestick;
