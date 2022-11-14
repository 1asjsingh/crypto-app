import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./components/Navbar.js";
import Coins from "./components/Coins.js";
import CoinDetails from "./components/CoinDetails.js";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={<Coins />}
          />

          <Route
            path="/:coin"
            element={<CoinDetails />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
