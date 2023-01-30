import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "./axios";
import Loading from "./Loading";
import { getDetails } from "./requests.js";
import Chart from "./Chart.js";
import "./CoinDetail.css";

function CoinDetails({ request_url }) {
  const { coin } = useParams();
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const request = await axios.get(getDetails(coin));
      setDetails(request.data);
      return request;
    };
    getData();
  }, [coin]);
  console.log(details.market_data)
  if (details.length === 0) return <Loading />;

  return (
    <div>
      <div className="container">
        <div className="info-top">
          <div className="coin-img">
            <img src={details.image.large} alt="currency icon" />
          </div>
          <div>
            <h1 className="coin-title">{details.name}</h1>
          </div>
          <div className="row">
            <h2 className="coin-header-price col detail-card">${details.market_data.current_price.usd}</h2>
            <h2 className="coin-header-change col detail-card" style={{color: details.market_data.price_change_24h_in_currency.usd < 0 ? "red" : "green"}}>{details.market_data.price_change_percentage_24h_in_currency.usd.toFixed(2)}%</h2>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="coin-chart col detail-card">
            <Chart currency={"usd"} />
          </div>
        </div>
        <div className="row">
          <div className="coin-info col detail-card">
            <p>
              <em>Price:</em> {details.market_data.current_price.usd}
            </p>
            <p>
              <em>All-Time High:</em> {details.market_data.ath.usd}
            </p>
            <p>
              <em>High (24H):</em> {details.market_data.high_24h.usd}
            </p>
            <p>
              <em>24H Low (24H):</em> {details.market_data.low_24h.usd}
            </p>
            <p>
              <em>Market Capitilisation:</em>{" "}
              {details.market_data.market_cap.usd}
            </p>
            <p>
              <em>Price Change (24H):</em>{" "}
              {details.market_data.price_change_percentage_24h_in_currency.usd.toFixed(2)}%
            </p>
          </div>
          <div className="coin-description col detail-card">
            <div dangerouslySetInnerHTML={{__html: details.description.en}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoinDetails;
