import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./components/Navbar.js";
import Coins from "./components/Coins.js";
import CoinDetails from "./components/CoinDetails.js";
import SignIn from "./components/SignIn.js";
import Register from "./components/Register.js";
import { AuthenticationProvider } from "./contexts/AuthenticationContext";
import ProtectedRoutes from "./contexts/ProtectedRoutes";
import Portfolio from "./components/Portfolio";
import { UserContext } from "./contexts/UserContext";

function App() {
  const [currency, setCurrency] = useState();
  useEffect(() => {
    if (currency) {
      localStorage.setItem("currency", currency);
    }
  }, [currency]);

  return (
    <Router>
      <AuthenticationProvider>
        <UserContext.Provider value={{ currency, setCurrency }}>
          <div className="App">
            <Navbar />
            <Routes>
              <Route element={<ProtectedRoutes />}>
                <Route path="/" exact element={<Coins />} />
                <Route path="/:coin" element={<CoinDetails />} />
                <Route path="/portfolio" element={<Portfolio />} />
              </Route>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </UserContext.Provider>
      </AuthenticationProvider>
    </Router>
  );
}

export default App;
