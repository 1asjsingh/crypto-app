import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./components/Navbar.js";
import Coins from "./components/Coins.js";
import requests from "./components/requests.js";

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
      </div>
    </Router>
  );
}

export default App;
