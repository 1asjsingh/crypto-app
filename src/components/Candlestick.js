import React, { useState, useEffect } from "react";
import axios from "./axios";
import ReactApexChart from "react-apexcharts";
import { getCandleChart } from "./requests.js";
import Loading from "./Loading";
import "./Candlestick.css";

function Candlestick({ currency, coin, gameData }) {
  const [candleData, setCandleData] = useState([]);
  const [loading, setLoading] = useState(true);
  let [range, setRange] = useState(1);

  useEffect(() => {
    async function getCandleData() {
      await axios.get(getCandleChart(coin, currency, range)).then((res) => {
        setCandleData(res.data);
        setLoading(false);
      });
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
    <div>
      <div className="container">
      {!gameData &&
        <div className="row">
          <button
            type="button"
            onClick={() => setRange(1)}
            className="btn date-btn col"
          >
            1D
          </button>
          <button
            type="button"
            onClick={() => setRange(7)}
            className="btn date-btn col"
          >
            7D
          </button>
          <button
            type="button"
            onClick={() => setRange(30)}
            className="btn date-btn col"
          >
            1M
          </button>
          <button
            type="button"
            onClick={() => setRange(365)}
            className="btn date-btn col"
          >
            1Y
          </button>
          <button
            type="button"
            onClick={() => setRange("max")}
            className="btn date-btn col"
          >
            Max
          </button>
        </div>}
        <div>
          <ReactApexChart
            options={options}
            series={series}
            type="candlestick"
            height={600}
          />
        </div>
      </div>
    </div>
  );
}

export default Candlestick;
