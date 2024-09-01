import React, { useState } from 'react';
import Modal from 'react-modal';
import './CreatePollModal.css';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreatePollModal = ({ isOpen, onRequestClose, quizTitle, quizType }) => {
    const [questions, setQuestions] = useState([
        { 
            questionNumber: 1, 
            questionText: '', 
            options: [{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }], 
            optionCount: 2,
            selectedOptionType: 'text'
        }
    ]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const navigate = useNavigate();

    const currentQuestion = questions[currentQuestionIndex];

    const handleInputChange = (e) => {
        const { value } = e.target;
        updateCurrentQuestion({ questionText: value });
    };

    const handleOptionTypeChange = (e) => {
        const { value } = e.target;
        updateCurrentQuestion({ selectedOptionType: value });
    };

    const handleOptionChange = (e, optionIndex, field) => {
        const { value } = e.target;
        const updatedOptions = [...currentQuestion.options];
        updatedOptions[optionIndex] = {
            ...updatedOptions[optionIndex],
            [field]: value
        };
        updateCurrentQuestion({
            options: updatedOptions,
        });
    };

    const addOption = () => {
        if (currentQuestion.optionCount >= 4) {
            // Limit the number of options to 5
            return;
        }
        const updatedOptions = [
            ...currentQuestion.options,
            { text: '', imageUrl: '' }
        ];
        updateCurrentQuestion({
            options: updatedOptions,
            optionCount: currentQuestion.optionCount + 1
        });
    };

    const removeOption = (optionIndex) => {
        if (currentQuestion.optionCount <= 2) {
            // Maintain at least 2 options
            return;
        }
        const updatedOptions = currentQuestion.options.filter((_, index) => index !== optionIndex);
        updateCurrentQuestion({
            options: updatedOptions,
            optionCount: currentQuestion.optionCount - 1
        });

        if (currentQuestion.correctOption === optionIndex.toString()) {
            updateCurrentQuestion({
                correctOption: '',
                correctAnswer: ''
            });
        }
    };


    const handleTimerClick = (value) => {
        updateCurrentQuestion({ timer: value });
    };

    const handleAddQuestion = () => {
        if (questions.length >= 5) {
            return;
        }
        setQuestions([
            ...questions,
            { 
                questionNumber: questions.length + 1, 
                questionText: '', 
                options: [{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }], 
                correctOption: '', 
                correctAnswer: '', 
                timer: '', 
                optionCount: 2,
                selectedOptionType: 'text'
            }
        ]);
        setCurrentQuestionIndex(questions.length);
    };

    const updateCurrentQuestion = (updatedFields) => {
        const updatedQuestions = questions.map((question, index) =>
            index === currentQuestionIndex ? { ...question, ...updatedFields } : question
        );
        setQuestions(updatedQuestions);
    };

    const handleCancel = () => {
        onRequestClose();
        resetStates();
    };

    const resetStates = () => {
        setQuestions([
            {
                questionNumber: 1,
                questionText: '',
                options: [{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }],
                correctOption: '',
                correctAnswer: '',
                timer: '',
                optionCount: 2,
                selectedOptionType: 'text'
            }
        ]);
        setCurrentQuestionIndex(0);
    };

    const handleCreateQuiz = async () => {
        try {
            console.log(JSON.stringify({ quizTitle, questions }));

            // Validate questions and options
            const validQuestions = questions.map(question => ({
                ...question,
                options: question.options.map(option => ({
                    text: option.text || '',
                    imageUrl: option.imageUrl || ''
                })),
                questionText: question.questionText || 'Default Question Text'
            }));

            const response = await axios.post('http://localhost:4000/users/createPoll', { quizTitle, questions: validQuestions, quizType });
            console.log("response  ", response.data.data._id);
            console.log("response  ", response.data.data);

            const randomToken = response.data.data._id;
    
            navigate(`/takePoll/${randomToken}`);

            handleCancel(); // Reset the form after submission
        } catch (error) {
            console.error('Error creating quiz:', error.response?.data?.error || error.message);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Create Quiz Questions"
            className="create-quiz-modal2"
            overlayClassName="create-quiz-overlay2"
        >
            <div className="modal2-content">
                <div className="question-buttons">
                    {questions.map((question, index) => (
                        <button
                            key={question.questionNumber}
                            className={`question-number-button ${index === currentQuestionIndex ? 'active' : ''}`}
                            onClick={() => setCurrentQuestionIndex(index)}
                        >
                            {question.questionNumber}
                        </button>
                    ))}
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23808080' d='M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z'/%3E%3C/svg%3E" alt="Add" className="add-question-button" onClick={handleAddQuestion}/>
                    <span className="max-questions-text">Max 5 Questions</span>
                </div>
                <input 
                    type="text" 
                    placeholder="Enter your question" 
                    className="question-input" 
                    value={currentQuestion.questionText}
                    onChange={handleInputChange}
                />
                <div className="option-type-row">
                    <div className="option-type-label">Option Type:</div>
                    <label>
                        <input 
                            type="radio" 
                            name="optionType" 
                            value="text" 
                            checked={currentQuestion.selectedOptionType === 'text'}
                            onChange={handleOptionTypeChange} 
                        />
                        Text
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            name="optionType" 
                            value="imageUrl" 
                            checked={currentQuestion.selectedOptionType === 'imageUrl'}
                            onChange={handleOptionTypeChange} 
                        />
                        Image URL
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            name="optionType" 
                            value="textAndImageUrl" 
                            checked={currentQuestion.selectedOptionType === 'textAndImageUrl'}
                            onChange={handleOptionTypeChange} 
                        />
                        Text & Image URL
                    </label>
                </div>

                {currentQuestion.selectedOptionType === 'text' && (
                    <div className="options-timer-container">
                        <div className="options-container">
                            {currentQuestion.options.map((option, index) => (
                                <div
                                    className={`option-input-wrapper-poll`} 
                                    key={index}
                                >
                                    <div className="option-input-container">
                                
                                        <input 
                                            type="text" 
                                            placeholder="Text" 
                                            className="option-input" 
                                            value={option.text} 
                                            onChange={(e) => handleOptionChange(e, index, 'text')} 
                                        />
                                        {currentQuestion.optionCount > 2 && index >= 2 && (
                                            <FaTrash 
                                                className="delete-icon" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeOption(index);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button className="add-option-button" onClick={addOption}>
                                Add Option
                            </button>
                        </div>
                    </div>
                )}

                {currentQuestion.selectedOptionType === 'imageUrl' && (
                    <div className="options-timer-container">
                        <div className="options-container">
                            {currentQuestion.options.map((option, index) => (
                                <div
                                    className={`option-input-wrapper ${currentQuestion.correctOption === index.toString() ? 'correct-answer' : ''}`} 
                                    key={index}
                                >
                                    <div className="option-input-container">
                                        
                                        <input 
                                            type="text" 
                                            placeholder="Image URL" 
                                            className="option-input" 
                                            value={option.imageUrl} 
                                            onChange={(e) => handleOptionChange(e, index, 'imageUrl')} 
                                        />
                                        {currentQuestion.optionCount > 2 && index >= 2 && (
                                            <FaTrash 
                                                className="delete-icon" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeOption(index);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button className="add-option-button" onClick={addOption}>
                                Add Option
                            </button>
                        </div>
                    </div>
                )}

                {currentQuestion.selectedOptionType === 'textAndImageUrl' && (
                    <div className="options-timer-container">
                        <div className="options-container">
                            {currentQuestion.options.map((option, index) => (
                                <div
                                    className={`option-input-wrapper ${currentQuestion.correctOption === index.toString() ? 'correct-answer' : ''}`} 
                                    key={index}
                
                                >
                                    <div className="option-input-container">
                    
                                        <input 
                                            type="text" 
                                            placeholder="Text" 
                                            className="option-input" 
                                            value={option.text} 
                                            onChange={(e) => handleOptionChange(e, index, 'text')} 
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Image URL" 
                                            className="option-input" 
                                            value={option.imageUrl} 
                                            onChange={(e) => handleOptionChange(e, index, 'imageUrl')} 
                                        />
                                        {currentQuestion.optionCount > 2 && index >= 2 && (
                                            <FaTrash 
                                                className="delete-icon" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeOption(index);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button className="add-option-button" onClick={addOption}>
                                Add Option
                            </button>
                        </div>
                    </div>
                )}

                <div className="action-buttons-container">
                    <button className="action-button1" onClick={handleCancel}>Cancel</button>
                    <button className="action-button2" onClick={handleCreateQuiz}>Create Quiz</button>
                </div>
            </div>
        </Modal>
    );
};

export default CreatePollModal;