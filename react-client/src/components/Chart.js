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

function Chart({ currency, coin, prediction }) {
  const [chartData, setChartData] = useState([]);
  const [predData, setPredData] = useState([]);
  let [range, setRange] = useState(!prediction ? 1 : 365);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      try {
        let res = await axios.get(getChart(coin, currency, range));
        res = res.data.prices;

        if (prediction) {
          let todayTime = parseInt(res[res.length - 1][0]);

          let todayUnix = new Date(todayTime);
          todayUnix = moment(todayUnix).format("L HH:mm");

          let predArr = prediction.map((price) => {
            todayTime += 86400000; //CHANGE =============================
            let unix = new Date(todayTime);
            unix = moment(unix).format("L HH:mm");
            return { x: unix, y: price };
          });

          predArr.unshift({
            x: todayUnix,
            y: res[res.length - 1][1],
          });

          setPredData(predArr);

          if (res.length > 150) {
            res = res.splice(-100, 100);
          }
        }

        setChartData(res);
        setLoading(false);
        return res;
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
    getData();
  }, [coin, currency, range, prediction]);

  if (loading) return <Loading />;

  const times = chartData.map((data) => {
    let unix = new Date(data[0]);
    if (range === "1") {
      return moment(unix).format("LT");
    } else {
      return moment(unix).format("L HH:mm");
    }
  });

  let prices = chartData.map((data) => {
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

  let zoomOptions;

  if (!prediction) {
    zoomOptions = {
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
    };
  }

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
    plugins: zoomOptions,
  };

  const data = {
    labels: times,
    datasets: [
      {
        fill: true,
        data: prices,
        borderColor: "rgb(60, 90, 214)",
        backgroundColor: "rgb(60, 90, 214, 0.3)",
        pointRadius: 0,
        spanGaps: true,
      },
      {
        fill: true,
        data: predData,
        borderColor: "rgb(124,252,0)",
        backgroundColor: "rgb(124, 252, 0, 0.3)",
        pointRadius: 0,
      },
    ],
  };

  return (
    <div>
      <Container>
        {!prediction && (
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
        )}

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
