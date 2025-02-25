import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Ledger from './pages/Ledger'
import Account from './pages/Account'
import Categories from './pages/Categories'

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/ledger/:ledgerId" element={<Ledger />} />
        <Route path="/ledger/:ledgerId/account/:accountId" element={<Account />} />
        <Route path="/categories" element={<Categories />} />
      </Routes>
    </Router>
  )
}

export default App
