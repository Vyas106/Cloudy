import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './page/LandingPage';
import UserDashboard from './page/UserDashboard';
// import Login from './Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route 
          path="/login" 
          element={<Login onLogin={handleLogin} />} 
        /> */}
        <Route 
          path="/dashboard" 
          element={
            
              <UserDashboard  /> 
              
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;














