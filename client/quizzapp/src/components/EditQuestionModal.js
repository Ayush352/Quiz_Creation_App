import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './CreateQuestionsModal.css';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditQuestionModal = ({ isOpen, onRequestClose, quizTitle, quizType, editId, isEdit, isQuiz }) => {

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizzesAndPolls,setQuizzesAndPolls] = useState(null)
    const navigate = useNavigate();
    useEffect(() => {
        if (isOpen && editId) {
            const fetchQuizData = async () => {
                try {
                    const quizzesResponse = await axios.get('http://localhost:4000/users/quizzes'); // Update with your endpoint
            const pollsResponse = await axios.get('http://localhost:4000/users/polls'); // Update with your endpoint
    
            const combinedData = [
              ...quizzesResponse.data.data.map(item => ({ ...item, type: 'quiz' })),
              ...pollsResponse.data.data.map(item => ({ ...item, type: 'poll' })),
            ];
            setQuizzesAndPolls(combinedData);
            combinedData.forEach(item=>{
                if(item._id===editId){
                    setQuestions(item.questions)
                    
                }
                else{console.log(questions,editId,item._id)}
            })
                } catch (error) {
                    console.error('Error fetching quiz data:', error.response?.data?.error || error.message);
                }
            };
            fetchQuizData();
        } else {

            if(isQuiz===true){
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
            }
            else{
                setQuestions([
                    { 
                        questionNumber: 1, 
                        questionText: '', 
                        options: [{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }], 
                        optionCount: 2,
                        selectedOptionType: 'text'
                    }
                ])
            }
           
        }
    }, [isOpen, editId]);
   
    
    const currentQuestion = questions[currentQuestionIndex] || {
        questionText: '',
        options: [{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }],
        selectedOptionType: 'text',
        timer: '',
        optionCount: 2,
        correctOption: '',
        correctAnswer: ''
    };

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
            options: updatedOptions
        });
    };

    const addOption = () => {
        if (currentQuestion.optionCount >=4 ) {
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
            return;
        }
        const updatedOptions = currentQuestion.options.filter((_, index) => index !== optionIndex);
        updateCurrentQuestion({
            options: updatedOptions,
            optionCount: currentQuestion.optionCount - 1
        });

        // Reset correct answer if the removed option was selected
        if (currentQuestion.correctOption === optionIndex.toString()) {
            updateCurrentQuestion({
                correctOption: '',
                correctAnswer: ''
            });
        }
    };

    const handleOptionClick = (optionIndex) => {
        updateCurrentQuestion({
            correctOption: optionIndex.toString(),
            correctAnswer: currentQuestion.options[optionIndex].text || currentQuestion.options[optionIndex].imageUrl
        });
    };

    const handleTimerClick = (value) => {
        updateCurrentQuestion({ timer: value });
    };

    // Save the edited questions and close modal
    const handleSaveChanges = async () => {
        try {
            // Validate questions and options
            const validQuestions = questions.map(question => ({
                ...question,
                options: question.options.map(option => ({
                    text: option.text || '',
                    imageUrl: option.imageUrl || '',
                    view: isQuiz ? undefined : option.view || 0 
                })),
                questionText: question.questionText || 'Default Question Text'
            }));
            if(isQuiz===true){
                await axios.put(`http://localhost:4000/users/updateQuiz/${editId}`, { quizTitle, questions: validQuestions, quizType });
            }
            else{
                await axios.put(`http://localhost:4000/users/updatePoll/${editId}`, { quizTitle, questions: validQuestions, quizType });
            }
            
            console.log("Quiz updated successfully!");

            navigate('/dashboard'); // Navigate back to dashboard or another page after saving
            onRequestClose(); // Close the modal
        } catch (error) {
            console.error('Error updating quiz:', error.response?.data?.error || error.message);
        }
    };

    const updateCurrentQuestion = (updatedFields) => {
        const updatedQuestions = questions.map((question, index) =>
            index === currentQuestionIndex ? { ...question, ...updatedFields } : question
        );
        setQuestions(updatedQuestions);
    };

    const handleCancel = () => {
        onRequestClose();
    };
    console.log("createQuestionModal")
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
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23808080' d='M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z'/%3E%3C/svg%3E" alt="Add" className="add-question-button"/>
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
                            
                        />
                        Text
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            name="optionType" 
                            value="imageUrl" 
                            checked={currentQuestion.selectedOptionType === 'imageUrl'}
                             
                        />
                        Image URL
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            name="optionType" 
                            value="textAndImageUrl" 
                            checked={currentQuestion.selectedOptionType === 'textAndImageUrl'}
                            
                        />
                        Text & Image URL
                    </label>
                </div>

                {currentQuestion.selectedOptionType === 'text' && (
                    <div className="options-timer-container">
                        <div className="options-container">
                            {currentQuestion.options.map((option, index) => (
                                <div
                                    className={"option-input-wrapper"} 
                                    key={index}
                                >
                                    <div className={`option-input-wrapper ${currentQuestion.correctOption === index.toString() ? 'correct-answer' : ''}`}>
                                    {isQuiz && (<input 
                            type="radio" 
                            name="optionType" 
                            value="text" 
                            checked={currentQuestion.selectedOptionType === 'text'}
                            
                        />)}
                                        <input 
                                            type="text" 
                                            placeholder="Text" 
                                            className="option-input" 
                                            value={option.text} 
                                            onChange={(e) => handleOptionChange(e, index, 'text')} 
                                        />
                                        
                                    </div>
                                </div>
                            ))}
                            <button className="add-option-button">
                                Add Option
                            </button>
                        </div>
                        {isQuiz===true && (<div className="timer-buttons-wrapper">
                            <div className="timer-label">Timer</div>
                            {["OFF", '10', '15'].map((value) => (
                                <button
                                    key={value}
                                    className={`timer-button ${currentQuestion.timer === value ? 'selected-timer' : ''}`}
                                    onClick={() => handleTimerClick(value)}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>)}
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
                                    {isQuiz && (<input 
                            type="radio" 
                            name="optionType" 
                            value="text" 
                            checked={currentQuestion.selectedOptionType === 'text'}
                            
                        />)}
                                        <input 
                                            type="text" 
                                            placeholder="Image URL" 
                                            className="option-input" 
                                            value={option.imageUrl} 
                                            onChange={(e) => handleOptionChange(e, index, 'imageUrl')} 
                                        />
                                    
                                    </div>
                                </div>
                            ))}
                            <button className="add-option-button">
                                Add Option
                            </button>
                        </div>
                        {isQuiz===true && (<div className="timer-buttons-wrapper">
                            <div className="timer-label">Timer</div>
                            {["OFF", '10', '15'].map((value) => (
                                <button
                                    key={value}
                                    className={`timer-button ${currentQuestion.timer === value ? 'selected-timer' : ''}`}
                                    onClick={() => handleTimerClick(value)}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>)}
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
                                    {isQuiz && (<input 
                            type="radio" 
                            name="optionType" 
                            value="text" 
                            checked={currentQuestion.selectedOptionType === 'text'}
                            
                        />)}
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
                                        
                                    </div>
                                </div>
                            ))}
                            <button className="add-option-button">
                                Add Option
                            </button>
                        </div>
                        {isQuiz===true && (<div className="timer-buttons-wrapper">
                            <div className="timer-label">Timer</div>
                            {["OFF", '10', '15'].map((value) => (
                                <button
                                    key={value}
                                    className={`timer-button ${currentQuestion.timer === value ? 'selected-timer' : ''}`}
                                    onClick={() => handleTimerClick(value)}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>)}
                    </div>
                )}

                <div className="action-buttons-container">
                    <button className="action-button1" onClick={handleCancel}>Cancel</button>
                    <button className="action-button2" onClick={handleSaveChanges}>Create Quiz</button>
                </div>
            </div>
        </Modal>
    );
};

export default EditQuestionModal;