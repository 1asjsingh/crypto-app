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
  const getLocalCurr = () => {
    return localStorage.getItem("currency").substring(0, 3);
  };
  const getSymbol = () => {
    return localStorage.getItem("currency").substring(3, 4);
  };

  useEffect(() => {
    const getData = async () => {
      const request = await axios.get(getDetails(coin));
      setDetails(request.data);
      return request;
    };
    getData();
  }, [coin]);

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
            <h2 className="coin-header-price col detail-card">
              {getSymbol()}
              {details.market_data.current_price[getLocalCurr()].toLocaleString("en-GB", {maximumFractionDigits: 20,})}
            </h2>
            <h2
              className="coin-header-change col detail-card"
              style={{
                color:
                  details.market_data.price_change_percentage_24h_in_currency[
                    getLocalCurr()
                  ] < 0
                    ? "red"
                    : "green",
              }}
            >
              {details.market_data.price_change_percentage_24h_in_currency[
                getLocalCurr()
              ].toFixed(2)}
              %
            </h2>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="coin-chart col detail-card">
            <Chart
              currency={getLocalCurr()}
            />
          </div>
        </div>
        <div className="row">
          <div className="coin-info col detail-card">
            <p>
              <em>Price:</em> {getSymbol()}{details.market_data.current_price[getLocalCurr()].toLocaleString("en-GB", {maximumFractionDigits: 20,})}
            </p>
            <p>
              <em>All-Time High:</em> {getSymbol()}{details.market_data.ath[getLocalCurr()].toLocaleString("en-GB", {maximumFractionDigits: 20,})}
            </p>
            <p>
              <em>High (24H):</em> {getSymbol()}{details.market_data.high_24h[getLocalCurr()].toLocaleString("en-GB", {maximumFractionDigits: 20,})}
            </p>
            <p>
              <em>Low (24H):</em> {getSymbol()}{details.market_data.low_24h[getLocalCurr()].toLocaleString("en-GB", {maximumFractionDigits: 20,})}
            </p>
            <p>
              <em>Market Capitilisation:</em>{" "}
              {getSymbol()}{details.market_data.market_cap[getLocalCurr()].toLocaleString("en-GB", {maximumFractionDigits: 20,})}
            </p>
            <p>
              <em>Price Change (24H):</em>{" "}
              {details.market_data.price_change_percentage_24h_in_currency[getLocalCurr()].toFixed(
                2
              )}
              %
            </p>
          </div>
          <div className="coin-description col detail-card">
            <div dangerouslySetInnerHTML={{ __html: details.description.en }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoinDetails;
