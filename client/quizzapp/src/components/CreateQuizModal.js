// CreateQuizModal.js
import React, { useState , useEffect} from 'react';
import Modal from 'react-modal';
import CreateQuestionsModal from './CreateQuestionsModal';
import "./Dashboard.css"
import CreatePollModal from './CreatePollModal';

Modal.setAppElement('#root');

const CreateQuizModal = ({ isOpen, onRequestClose, quizTitle, setQuizTitle }) => {
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [quizType, setQuizType] = useState('');
  
  useEffect(() => {
    setQuizTitle('')
    setQuizType('')
  }, []);

  const handleQuizButtonClick = (buttonIndex) => {
    setActiveButton(buttonIndex);
    setQuizType('Q & A')
  };

  const handlePollButtonClick = (buttonIndex) => {
    setActiveButton(buttonIndex);
    setQuizType('Poll')
  };

  const handleContinue = () => {
    setIsModal2Open(true);
    onRequestClose();
  };

  const handleInputChange = (e) => {
    setQuizTitle(e.target.value);
  };

  const closeModal = () => {
    onRequestClose();
    setIsModal2Open(false);
  };
console.log(isOpen)
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
          onChange={handleInputChange}
          placeholder="Enter quiz title"
          className="quiz-title-input"
        />
        <div className="select-row">
          <div className="select-text">Quiz Type</div>
          <button
            className={`select-button ${activeButton === 1 ? 'active' : ''}`}
            onClick={() => handleQuizButtonClick(1)}
          >
            Q & A
          </button>
          <button
            className={`select-button ${activeButton === 2 ? 'active' : ''}`}
            onClick={() => handlePollButtonClick(2)}
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
        <CreateQuestionsModal
          isOpen={isModal2Open}
          onRequestClose={closeModal}
          quizTitle={quizTitle}
          quizType={quizType}
        />
      ):
      (
        <CreatePollModal
          isOpen={isModal2Open}
          onRequestClose={closeModal}
          quizTitle={quizTitle}
          quizType={quizType}
        />
      )
    }
    </>
  );
};

export default CreateQuizModal;
