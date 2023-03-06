import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import NavigationBar from "./components/NavigationBar.js";
import Coins from "./components/Coins.js";
import CoinDetails from "./components/CoinDetails.js";
import SignIn from "./components/SignIn.js";
import Register from "./components/Register.js";
import { AuthenticationProvider } from "./contexts/AuthenticationContext";
import ProtectedRoutes from "./contexts/ProtectedRoutes";
import Portfolio from "./components/Portfolio";
import History from "./components/History";
import { UserContext } from "./contexts/UserContext";
import PageNotFound from "./components/PageNotFound";
import Game from "./components/Game";
import PublicRoutes from "./contexts/PublicRoutes";
import Leaderboard from "./components/Leaderboard";

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
            <NavigationBar />
            <Routes>
              <Route path="*" element={<PageNotFound />} />
              <Route element={<ProtectedRoutes />}>
                <Route path="/" exact element={<Coins />} /> 
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/history" element={<History />} />
                <Route path="/game" element={<Game />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/:coin" element={<CoinDetails />} />
              </Route>
              <Route element={<PublicRoutes />}>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route path="/notfound" element={<PageNotFound />} />
            </Routes>
          </div>
        </UserContext.Provider>
      </AuthenticationProvider>
    </Router>
  );
}

export default App;
