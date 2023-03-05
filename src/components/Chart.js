import React, { useState, useEffect } from "react";
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
import { Button, Col, Container, Row } from "react-bootstrap";
ChartJS.register(zoomPlugin);

function Chart({ currency, coin }) {
  const [chartData, setChartData] = useState([]);
  let [range, setRange] = useState(1);

  useEffect(() => {
    async function getData() {
      try {
        const res = await axios.get(getChart(coin, currency, range));
        setChartData(res.data);
        return res;
      } catch (e) {
        alert(e);
      }
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
          mode: "x",
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
      <Container>
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
            <Button className="w-100" onClick={() => setRange(31)}>
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

        <div className="mt-4">
          <Row>
            <Line options={options} data={data} />
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default Chart;
