import React from "react";
import "./Portfolio.css";

function Portfolio() {
  return (
    <div className="container">
      <div className="container">
        <h1>Portfolio</h1>
      </div>

      <div className="container">
        <div className="row">
          <div className="portfolio-balance">
            <h1>$15,000</h1>
            <h4 style={{ color: "green" }}>+3.05%</h4>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="portfolio-chart">
            <h1>chart</h1>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="portfolio-stats">
            <h1>Stats</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
