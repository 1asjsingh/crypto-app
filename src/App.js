import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import PageNotFound from "./components/PageNotFound";
import Game from "./components/Game";
import Leaderboard from "./components/Leaderboard";

function App() {
  return (
    <Router>
      <AuthenticationProvider>
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
              <Route path="/signin" element={<SignIn />} />
              <Route path="/register" element={<Register />} />
            <Route path="/notfound" element={<PageNotFound />} />
          </Routes>
        </div>
      </AuthenticationProvider>
    </Router>
  );
}

export default App;
