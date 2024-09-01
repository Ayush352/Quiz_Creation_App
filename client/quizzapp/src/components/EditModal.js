import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios
 from 'axios';
import CreateQuestionsModal from './CreateQuestionsModal';
import "./Dashboard.css"
import CreatePollModal from './CreatePollModal';
import EditQuestionModal from './EditQuestionModal';

Modal.setAppElement('#root');

const EditModal = ({ isOpen, onRequestClose, quizTitle, setQuizTitle, isEdit, editId }) => {
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [quizType, setQuizType] = useState('');
  const [quizzesAndPolls, setQuizzesAndPolls] = useState(null)
  const [isQuiz, setIsQuiz] = useState(true);

  useEffect(() => {
    if (isEdit && editId) {
      // Fetch the quiz data to populate fields if needed
      const fetchQuizData = async () => {
        try { 
            const quizzesResponse = await axios.get('https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com/users/quizzes'); // Update with your endpoint
            const pollsResponse = await axios.get('https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com/users/polls'); // Update with your endpoint
    
            const combinedData = [
              ...quizzesResponse.data.data.map(item => ({ ...item, type: 'quiz' })),
              ...pollsResponse.data.data.map(item => ({ ...item, type: 'poll' })),
            ];
            setQuizzesAndPolls(combinedData);
            combinedData.forEach(item=>{
                if(item._id===editId){
                    setQuizTitle(item.quizTitle);
                    setQuizType(item.type === 'quiz' ? 'Q & A' : 'Poll');
                    setActiveButton(item.type === 'quiz' ? 1 : 2);
                    if(item.type==='poll'){
                        setIsQuiz(false)
                    }
                }
            })
          // You can also set other fields here as needed
        } catch (error) {
          console.error("Error fetching quiz data:", error);
        }
      };
      fetchQuizData();
    }
  }, [isEdit, editId, setQuizTitle]);


  const handleContinue = () => {
    setIsModal2Open(true);
  };


  const closeModal = () => {
    onRequestClose();
    setIsModal2Open(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        contentLabel="Create Quiz"
        className="create-quiz-modal"
        overlayClassName="create-quiz-overlay"
      >
        <input
          type="text"
          value={quizTitle}
          placeholder="Enter quiz title"
          className="quiz-title-input"
        />
        <div className="select-row">
          <div className="select-text">Quiz Type</div>
          <button
            className={`select-button ${activeButton === 1 ? 'active' : ''}`}
            disabled={true}
          >
            Q & A
          </button>
          <button
            className={`select-button ${activeButton === 2 ? 'active' : ''}`}
            disabled={true}
          >
            Poll
          </button>
        </div>
        <div className="action-buttons-container">
          <button className="action-button1" onClick={closeModal}>Cancel</button>
          <button className="action-button2" onClick={handleContinue}>Continue</button>
        </div>
      </Modal>
      {isModal2Open && (quizType ==="Q & A") ? (
        ((isEdit===false) ? (<CreateQuestionsModal
          isOpen={isModal2Open}
          onRequestClose={closeModal}
          quizTitle={quizTitle}
          quizType={quizType}
        />):
        (<EditQuestionModal
            isOpen={isModal2Open}
            onRequestClose={closeModal}
            quizTitle={quizTitle}
            quizType={quizType}
            isEdit={isEdit}
            editId={editId}
            isQuiz={isQuiz}
          />)
        ))
      :
      ((isEdit===false)?
        (<CreatePollModal
          isOpen={isModal2Open}
          onRequestClose={closeModal}
          quizTitle={quizTitle}
          quizType={quizType}
        />)
        :
        (
            <EditQuestionModal
            isOpen={isModal2Open}
            onRequestClose={closeModal}
            quizTitle={quizTitle}
            quizType={quizType}
            isEdit={isEdit}
            editId={editId}
            isQuiz={isQuiz}
          />
        )
      )
    }
    </>
  );
};

export default EditModal;
