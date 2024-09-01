import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateQuizModal from './CreateQuizModal';
import './QuestionAnalysis.css'; // You'll need to create this CSS file

const QuestionAnalysis = ({onLogout}) => {
  const [isModal1Open, setIsModal1Open] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizData, setQuizData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.get(`https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com/questionAnalysis/${id}`);
        setQuizData(response.data.data);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };
    fetchQuizData();
  }, [id]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-GB', options);
    return formattedDate.replace(/(\w{3}) (\d{4})/, '$1, $2');
  };

  const handleLogout = () => {
    onLogout(); 
    navigate('/login'); 
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2 className="sidebar-heading">QUIZZIE</h2>
        <div className="sidebar-container">
          <button className="sidebar-button" onClick={() => handleNavigation('/dashboard')}>Dashboard</button>
          <button className="sidebar-button" onClick={() => handleNavigation('/analytics')}>Analytics</button>
          <button className="sidebar-button" onClick={() => setIsModal1Open(true)}>Create Quiz</button>
          <CreateQuizModal
            isOpen={isModal1Open}
            onRequestClose={() => setIsModal1Open(false)}
            quizTitle={quizTitle}
            setQuizTitle={setQuizTitle}
          />
          <div className="sidebar-footer">
          <div className="line" />
          <p className="logout" onClick={handleLogout}>Logout</p>
        </div>
        </div>
      </div>
      <div className="content-area">
        {quizData ? (
          <div className="quiz-analysis">
            <div className="info-container">
              <div className="created-on">Created on: {formatDate(quizData.createdAt)}</div>
              <div className="impressions">Impressions: {quizData.impressions}</div>
            </div>
            <h1 className="quiz-title">{quizData.quizTitle} Question Analysis</h1>
            {quizData.questions.map((question, index) => (
              <div key={index} className="question-analysis">
                <h3 className="question-text">Question {index + 1}: {question.questionText}</h3>
                <div className="stats-container">
                  <div className="stats-box">
                    <div className="score">{question.correctCount + question.wrongCount}</div>
                    <div className="content-box">people Attempted the question</div>
                  </div>
                  <div className="stats-box"><div className="score">{question.correctCount}</div>
                  <div className="content-box">people Answered Correctly</div>
                  </div>
                  <div className="stats-box"><div className="score">{question.wrongCount}</div>
                  <div className="content-box">people Answered Incorrectly</div>
                  </div>
                </div>
                <div className="vector-line"></div>
              </div>
              
            ))}
          </div>
        ) : (
          <p>Loading quiz data...</p>
        )}
      </div>
    </div>
  );
};

export default QuestionAnalysis;
