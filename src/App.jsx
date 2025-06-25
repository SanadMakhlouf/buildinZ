import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";

function App() {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="app">
      <Navbar />
      <div className="main-container">
        <Sidebar onServiceSelect={setSelectedService} />
        <MainContent selectedService={selectedService} />
      </div>
    </div>
  );
}

export default App;
