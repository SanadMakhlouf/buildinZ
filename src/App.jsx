import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import "./App.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import AdminPanel from './components/Admin/AdminPanel';
import dataService from './services/dataService';

function App() {
  const [selectedService, setSelectedService] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Load categories from the data service
    setCategories(dataService.getCategories());
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/" element={
            <div className="main-container">
              <Sidebar 
                categories={categories} 
                onServiceSelect={handleServiceSelect} 
              />
              <MainContent selectedService={selectedService} />
            </div>
          } />
        </Routes>
        
        {/* Admin link in footer */}
        <footer className="app-footer">
          <Link to="/admin" className="admin-link">Admin Panel</Link>
          <Link to="/" className="home-link">Home</Link>
        </footer>
      </div>
    </Router>
  );
}

export default App;
