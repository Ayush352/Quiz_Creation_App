import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from "./components/Signup";
import './components/RectangleLandingPage.css';
import Analytics from "./components/Analytics";
import Login from "./components/Login";
import React, { useState } from 'react'; 
import Dashboard from './components/Dashboard';
import TakeQuiz from './components/TakeQuiz';
import QuestionAnalysis from './components/QuestionAnalysis';
import TakePoll from './components/TakePoll';
import PollAnalysis from './components/PollAnalysis';
import EditModal from './components/EditModal';
import CreateQuizModal from './components/CreateQuizModal';

function App() {

  const [showLogin, setShowLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false); // Update authentication status
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/takeQuiz/:token" element={<TakeQuiz />} />
          <Route path="/takePoll/:token" element={<TakePoll />} />
          
          {isAuthenticated ? (
            <>
              <Route path="/dashboard" element={<Dashboard onLogout={handleLogout}/>} />
              <Route path="/analytics" element={<Analytics onLogout={handleLogout}/>} />
              <Route path="/create-quiz" element={<div>Create Quiz Page</div>} />
              <Route path="/questionAnalysis/:id" element={<QuestionAnalysis onLogout={handleLogout} />} />
              <Route path="/pollAnalysis/:id" element={<PollAnalysis onLogout={handleLogout}/>} />
              <Route path="/editModal/:id" element={<CreateQuizModal />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
              
            </>
          ) : (
            <Route
              path="*"
              element={
                <div className="rectangle-container">
                  <h2 className="heading">QUIZ</h2>
                  <div className="button-container">
                    <button 
                      className="login-btn" 
                      onClick={() => setShowLogin(true)}
                    >
                      Login
                    </button>
                    <button 
                      className="signup-btn" 
                      onClick={() => setShowLogin(false)}
                    >
                      Sign Up
                    </button>
                  </div>
                  <div className={`form-container ${showLogin ? 'active' : ''}`}>
                    <Login onLoginSuccess={handleLoginSuccess} />
                  </div>
                  <div className={`form-container ${!showLogin ? 'active' : ''}`}>
                    <Signup />
                  </div>
                </div>
              }
            />
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
