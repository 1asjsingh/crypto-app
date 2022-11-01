import { getMouseEventOptions } from "@testing-library/user-event/dist/utils";
import React, { useState, useEffect } from "react";
import axios from "./axios";
import "./Coins.css";

function Coins({ request_url }) {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    async function getData() {
      const request = await axios.get(request_url);
      setCoins(request.data);
      return request;
    }
    getData();
  }, [request_url]);
  return (
    <div className="row">
      {coins.map((coin) => (
        <div className="card" key={coin.symbol}>
          <div className="card-body">
            <img className="coin-img" src={coin.image} />
            <h5 className="card-title">{coin.name}</h5>
            <h6 className="card-subtitle mb-2 text-muted">
              {coin.symbol.toUpperCase()}
            </h6>
            <p className="card-text price">{coin.current_price}</p>
            <button type="button" className="btn btn-primary sign-in">
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Coins;
