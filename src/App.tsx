import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@features/auth/Login";
import Register from "@features/auth/Register";
import Home from "@features/home/Home";
import Ledger from "@features/ledger/Ledger";
import Account from "@features/account/Account";
import Categories from "@features/categories/Categories";
import Insights from "./features/insights/Insights";
import Profile from "@features/profile/Profile";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/ledger" element={<Ledger />} />
        <Route path="/account/:accountId" element={<Account />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
