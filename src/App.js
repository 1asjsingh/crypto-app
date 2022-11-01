import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar.js";
import Coins from "./Coins.js";
import requests from "./requests.js";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={<Coins request_url={requests.getCurrencies} />}
          />
        </Routes>
      </div>s
    </Router>
  );
}

export default App;
