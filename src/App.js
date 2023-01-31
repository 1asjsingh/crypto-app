import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./components/Navbar.js";
import Coins from "./components/Coins.js";
import CoinDetails from "./components/CoinDetails.js";
import SignIn from "./components/SignIn.js";
import Register from "./components/Register.js";
import { AuthenticationProvider } from "./contexts/AuthenticationContext";
import ProtectedRoutes from "./contexts/ProtectedRoutes";
import Portfolio from "./components/Portfolio";

function App() {
  return (
    <Router>
      <AuthenticationProvider>
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
      </AuthenticationProvider>
    </Router>
  );
}

export default App;
