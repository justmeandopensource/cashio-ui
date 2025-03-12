import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@features/auth/Login";
import Register from "@features/auth/Register";
import Home from "@features/home/Home";
import Ledger from "@features/ledger/Ledger";
import Account from "@features/account/Account";
import Categories from "@features/categories/Categories";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/ledger/:ledgerId" element={<Ledger />} />
        <Route
          path="/ledger/:ledgerId/account/:accountId"
          element={<Account />}
        />
        <Route path="/categories" element={<Categories />} />
      </Routes>
    </Router>
  );
};

export default App;
