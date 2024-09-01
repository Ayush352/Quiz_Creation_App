import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import CreateQuizModal from './CreateQuizModal';
import axios from 'axios';

const Dashboard = ({onLogout}) => {
  const [quizCreated, setQuizCreated] = useState(0);
  const [questionsCreated, setQuestionsCreated] = useState(0);
  const [totalImpressions, setTotalImpression] = useState(0);
  const [quizTitle, setQuizTitle] = useState('');
  const [isModal1Open, setIsModal1Open] = useState(false);
  const navigate = useNavigate();
  

  // Fetch data from the database
  const fetchData = async () => {
    try {
      const quizzesResponse = await axios.get('http://localhost:4000/users/quizzes'); // Update with your endpoint
            const pollsResponse = await axios.get('http://localhost:4000/users/polls'); // Update with your endpoint
    
            const combinedData = [
              ...quizzesResponse.data.data.map(item => ({ ...item, type: 'quiz' })),
              ...pollsResponse.data.data.map(item => ({ ...item, type: 'poll' })),
            ];
      const quizzes = combinedData// Extract the quizzes from the response

      // Count quizzes
      const quizCount = quizzes.length;

      // Count total questions
      const questionCount = quizzes.reduce((total, quiz) => total + quiz.questions.length, 0);
      const impressionsCount = quizzes.reduce((total, quiz) => total + quiz.impressions, 0);

      setQuizCreated(quizCount);
      setQuestionsCreated(questionCount);
      setTotalImpression(impressionsCount);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Update the quizCreated and questionsCreated states when a quiz is added or deleted
  const updateData = async () => {
    fetchData();
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    onLogout(); 
    navigate('/login'); 
  };

  const formatNumber = (number) => {
    if (number >= 1000000) {
        return `${(number / 1000000).toFixed(1)}M`;
    } else if (number >= 1000) {
        return `${(number / 1000).toFixed(1)}k`;
    } else {
        return number.toString();
    }
};

const formattedImpressions = formatNumber(totalImpressions);


  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2 className="sidebar-heading">QUIZZIE</h2>
        <div className="sidebar-container">
          <button className="sidebar-button" onClick={() => handleNavigation('/dashboard')}>Dashboard</button>
          <button className="sidebar-button" onClick={() => handleNavigation('/analytics')}>Analytics</button>
          <button className="sidebar-button" onClick={() => setIsModal1Open(true)}>Create Quiz</button>
        </div>
        <div className="sidebar-footer">
          <div className="line" />
          <p className="logout" onClick={handleLogout}>Logout</p>
        </div>
      </div>
      <div className="content">
        <div className="box">
          <p className='quiz'><span className="number1">{quizCreated}</span> Quiz created</p>
        </div>
        <div className="box">
          <p className='question'><span className="number2">{questionsCreated}</span> Questions created</p>
        </div>
        <div className="box">
          <p className='impression'><span className="number3">{formattedImpressions}</span> Total Impressions</p>
        </div>
      </div>
      <CreateQuizModal
        isOpen={isModal1Open}
        onRequestClose={() => {
          setIsModal1Open(false);
          updateData(); // Update data when the modal is closed
        }}
        quizTitle={quizTitle}
        setQuizTitle={setQuizTitle}
        quiz
      />
    </div>
  );
};

export default Dashboard;
