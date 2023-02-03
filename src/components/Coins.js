import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./axios";
import "./Coins.css";
import { getCurrencies } from "./requests.js";
import Loading from "./Loading";

function Coins() {
  const [coins, setCoins] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      const request = await axios.get(
        getCurrencies(localStorage.getItem("currency").substring(0, 3))
      );
      setCoins(request.data);
      return request;
    }
    getData();
  }, []);

  if (coins.length === 0) return <Loading />;
  return (
    <div className="container-fluid">
      <div className="row">
        {coins.map((coin) => (
          <div className="card" key={coin.symbol}>
            <div className="card-body">
              <img className="card-img" src={coin.image} alt="currency icon" />
              <h5 className="card-title">{coin.name}</h5>
              <h6 className="card-subtitle mb-2 text-muted">
                {coin.symbol.toUpperCase()}
              </h6>
              <p className="card-text price">
                {localStorage.getItem("currency").substring(3, 4)}
                {coin.current_price.toLocaleString("en-GB", {
                  maximumFractionDigits: 20,
                })}
              </p>
              <button
                type="button"
                className="btn more-button"
                onClick={() => navigate(`/${coin.id}`)}
              >
                More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Coins;
