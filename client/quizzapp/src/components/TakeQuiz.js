import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './TakeQuiz.css';

const TakeQuiz = () => {
    const { token } = useParams();
    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState('');
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [timer, setTimer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [tokenId, setTokenId] = useState('');

    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const response = await axios.get(`https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com/takeQuiz/${token}`);
                setQuizData(response.data);
                initializeTimer(response.data.data.questions[0].timer);
                setTokenId(response.data.data._id);
            } catch (error) {
                console.error('Error fetching quiz data:', error);
            }
        };

        fetchQuizData();
    }, [token]);

    const sendResultsToServer = async () => {
        try {
            console.log('Sending results:', { correctAnswers: correctCount, wrongAnswers: wrongCount });
            await axios.post(`https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com/quizResults/${tokenId}`, {
                correctAnswers: correctCount,
                wrongAnswers: wrongCount
            });
        } catch (error) {
            console.error('Error sending results:', error);
        }
    };

    const initializeTimer = (timerValue) => {
        if (timerValue !== "OFF") {
            const parsedTime = parseInt(timerValue, 10);
            setTimer(parsedTime);
            setTimeLeft(parsedTime);
        } else {
            setTimer(null);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}s`;
    };

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else if (timeLeft === 0) {
            handleNextClick();
        }
    }, [timeLeft]);

    const handleOptionClick = (option) => {
        setSelectedOption(option);
    };

    useEffect(() => {
        if (showResult) {
            sendResultsToServer();
        }
    }, [showResult]);

    const handleNextClick = async () => {
        const currentQuestion = quizData.data.questions[currentQuestionIndex];

        let updatedCorrectCount = currentQuestion.correctCount;
        let updatedWrongCount = currentQuestion.wrongCount;

        if (selectedOption === '') {
            console.log("No option selected, marking as wrong.");
            updatedWrongCount += 1;
            setWrongCount(prev => prev + 1);
        } else if (selectedOption === currentQuestion.correctAnswer) {
            updatedCorrectCount += 1;
            setScore(prev => prev + 1);
            setCorrectCount(prev => prev + 1);
        } else {
            console.log("Selected wrong option.");
            updatedWrongCount += 1;
            setWrongCount(prev => prev + 1);
        }

        try {
            await axios.put(`https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com/updateQuestionCount/${quizData.data._id}/${currentQuestionIndex}`, {
                correctCount: updatedCorrectCount,
                wrongCount: updatedWrongCount
            });
        } catch (error) {
            console.error('Error updating question count:', error);
        }

        if (currentQuestionIndex < quizData.data.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption('');
            initializeTimer(quizData.data.questions[currentQuestionIndex + 1].timer);
        } else {
            setShowResult(true);
        }
    };

    if (!quizData) return <div>Loading...</div>;

    const currentQuestion = quizData.data.questions[currentQuestionIndex];
    const isImageOptions = currentQuestion.selectedOptionType === "imageUrl";

    return (
        <div className="page-container">
            <div className="card">
                {!showResult && (
                    <>
                        <div className="question-number">
                            {currentQuestionIndex + 1}/{quizData.data.questions.length}
                        </div>
                        {timer && <div className="timer">{formatTime(timeLeft)}</div>}
                    </>
                )}
                {showResult ? (
                    <div className="result">
                        <h1 className='congrats'>Congrats, the quiz is completed</h1>
                        <img 
                            src="https://s3-alpha-sig.figma.com/img/f47f/6d98/a013b07f931834dfba3cd6ddc9130436?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=hqgWGAHO1eoSVRrHiuP4GggRnoZT5~hNNRliyDBS~3Xsjz9uvHvcwBMIAkUjDOvR1X0Sz4IL17PmHvFPEojOw713O3YL~wR7KC6iwNtwC4RTZWwQRnbm10-GEqyFQ5S88k~2Ts6J8HekuikNXTRAQiCZUvQJv7hN19isOMyXlPY6SAp43wmE3a24Am~weZPVSs33iv3ADjGRVWxZdvkNSsu--LyWF4chWOYam18dgGqEjUE0~JoBOO5vraDdoe45YymaUwl88H13Oa-VN2OSR5m2RwrUPwJaHFv19cOgSUx1A2~Ma0SDfG4755t0SnAa69u2lp5RdRuHY1FtGfgToQ__"
                            alt="Congratulations"
                            className="congratulations-image"
                        />
                        <p className='displayScore'>Your score is {score} / {quizData.data.questions.length}</p>
                    </div>
                ) : (
                    <div className="quiz-content">
                        <h1 className="question">{currentQuestion.questionText}</h1>
                        <div className={`options ${isImageOptions ? 'image-options' : ''}`}>
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    className={`option ${selectedOption === option.text || selectedOption === option.imageUrl  ? 'selected' : ''}`}
                                    onClick={() => handleOptionClick(option.text)}
                                >
                                    {option.text && <span>{option.text}</span>}
                                    {option.imageUrl && <img src={option.imageUrl} alt={`Option ${index}`} />}
                                </button>
                            ))}
                        </div>
                        <button className="next-button" onClick={handleNextClick}>
                            {currentQuestionIndex < quizData.data.questions.length - 1 ? 'Next' : 'Finish'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TakeQuiz;
