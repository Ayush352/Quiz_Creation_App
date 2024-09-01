import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './TakePoll.css'; // Add any necessary styles here

const TakePoll = ({handlePollAuth}) => {
    const { token } = useParams();
    const [pollData, setPollData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [tokenId, setTokenId] = useState('');

    useEffect(() => {
        const fetchPollData = async () => {
            try {
                const response = await axios.get(`https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com/takePoll/${token}`);
                setPollData(response.data);
                setTokenId(response.data.data._id);
            } catch (error) {
                console.error('Error fetching poll data:', error);
            }
        };

        fetchPollData();
    }, [token]);

   

    const handleOptionClick = (option) => {
        setSelectedOption(option);
    };


    const handleNextClick = async () => {
        const currentQuestion = pollData.data.questions[currentQuestionIndex];
    
        if (selectedOption) {
            // Update view count of selected option
            try {
                await axios.put(`https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com/updateQuestionViewCount/${pollData.data._id}/${currentQuestionIndex}`, {
                    selectedOption: selectedOption
                });
            } catch (error) {
                console.error('Error updating view count:', error);
            }
        }
    
        if (currentQuestionIndex < pollData.data.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption('');
        } else {
            setShowResult(true);
        }
    };

    if (!pollData) return <div>Loading...</div>;

    const currentQuestion = pollData.data.questions[currentQuestionIndex];
    const isImageOptions = currentQuestion.selectedOptionType === "imageUrl";

    return (
        <div className="page-container">
            <div className="card">
                {!showResult && (
                    <>
                        <div className="question-number">
                            {currentQuestionIndex + 1}/{pollData.data.questions.length}
                        </div>
                    </>
                )}
                {showResult ? (
                    <div className="result">
                        <h1 className="congrats">Thank you for participating in the Poll</h1>
                    </div>
                ) : (
                    <div className="poll-content">
                        <h1 className="question">{currentQuestion.questionText}</h1>
                        <div className={`options ${isImageOptions ? 'image-options' : ''}`}>
                            {currentQuestion.options.map((option, index) => (
                               <button
                               key={index}
                               className={`option ${selectedOption === (option.imageUrl || option.text) ? 'selected' : ''}`}
                               onClick={() => handleOptionClick(option.imageUrl || option.text)}
                           >
                                {option.text && <span className="option-text">{option.text}</span>}
                                {option.imageUrl && <img src={option.imageUrl} alt={`Option ${index}`} className="option-image" />}
                                
                           </button>
                            ))}
                        </div>
                        <button className="next-button" onClick={handleNextClick}>
                            {currentQuestionIndex < pollData.data.questions.length - 1 ? 'Next' : 'Submit'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TakePoll;
