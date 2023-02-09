import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "./axios";
import { getChart } from "./requests.js";
import Loading from "./Loading";
import moment from "moment";
import "./chart.css";
import zoomPlugin from "chartjs-plugin-zoom";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(zoomPlugin);

function Chart({ currency }) {
  const [chartData, setChartData] = useState([]);
  const { coin } = useParams();
  let [range, setRange] = useState(1);

  useEffect(() => {
    async function getData() {
      const request = await axios.get(getChart(coin, currency, range));
      setChartData(request.data);
      return request;
    }
    getData();
  }, [coin, currency, range]);

  if (chartData.length === 0) return <Loading />;

  const times = chartData.prices.map((data) => {
    let unix = new Date(data[0]);
    if (range === "1") {
      return moment(unix).format("LT");
    } else {
      return moment(unix).format("L HH:mm");
    }
  });

  const prices = chartData.prices.map((data) => {
    return data[1];
  });

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler
  );

  const options = {
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 5,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
      axis: "x",
    },
    plugins: {
      zoom: {
        pan: {
            enabled: true,
            mode: 'x'
          },
        zoom: {
          wheel: {
            enabled: true,
          },
          mode: "x",
        },
      },
    },
  };

  const data = {
    labels: times,
    datasets: [
      {
        fill: true,
        data: prices,
        borderColor: "rgb(244, 0, 161)",
        backgroundColor: "rgb(244, 0, 161, 0.3)",
        pointRadius: 0,
      },
    ],
  };

  return (
    <div>
      <div className="container">
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
            onClick={() => setRange(31)}
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
        </div>

        <Line options={options} data={data} />
      </div>
    </div>
  );
}

export default Chart;
