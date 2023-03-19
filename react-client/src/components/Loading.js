import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Loading.css";

function Loading() {
  return (
    <div className="load-overlay">
      <div className="spinner-border" role="status">
        <span className="visually-hidden"></span>
      </div>
    </div>
  );
}

export default Loading;
