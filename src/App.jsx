import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./Login"
import Home from "./Home"

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App
