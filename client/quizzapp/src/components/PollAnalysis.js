import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateQuizModal from './CreateQuizModal';
import './PollAnalysis.css'; // You'll need to create this CSS file

const PollAnalysis = ({onLogout}) => {
  const [isModal1Open, setIsModal1Open] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [pollData, setPollData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPollData = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/pollAnalysis/${id}`);
        setPollData(response.data.data);
      } catch (error) {
        console.error("Error fetching poll data:", error);
      }
    };
    fetchPollData();
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
        {pollData ? (
          <div className="poll-analysis">
            <div className="info-container">
              <div className="created-on">Created on: {formatDate(pollData.createdAt)}</div>
              <div className="impressions">Impressions: {pollData.impressions}</div>
            </div>
            <h1 className="quiz-title">{pollData.quizTitle} Poll Analysis</h1>
            {pollData.questions.map((question, index) => (
              <div key={index} className="question-analysis">
                <h3 className="question-text">Question {index + 1}: {question.questionText}</h3>
                <div className="stats-container">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="stats-box-poll">
                        <div className="option-views">{option.view}</div>
                      <div className="option-content">
                        {question.selectedOptionType === 'imageUrl' && <img src={option.imageUrl} alt="Option Image" className="option-image" />}
                        {question.selectedOptionType === 'text' && <div className="option-text">{option.text}</div>}
                        {question.selectedOptionType === 'textAndImageUrl' && (
                          <>
                            <img src={option.imageUrl} alt="Option Image" className="option-image" />
                            <div className="option-text">{option.text}</div>
                          </>
                        )}
                      </div>
                      
                    </div>
                  ))}
                </div>
                <div className="vector-line"></div>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading poll data...</p>
        )}
      </div>
    </div>
  );
};

export default PollAnalysis;
