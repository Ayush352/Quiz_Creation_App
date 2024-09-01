import React from 'react';
import Modal from 'react-modal';
import './SuccessModal.css'; // Add your styles for this modal

const SuccessModal = ({ isOpen, onRequestClose, quizLink }) => {
    console.log("xtrhdcyhg")
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Quiz Published"
            className="success-modal"
            overlayClassName="success-overlay"
        >
            <div className="success-modal-content">
                <h2>Congrats! Your quiz got published</h2>
                <p>Access your quiz using the link below:</p>
                <input
                    type="text"
                    value={quizLink}
                    readOnly
                    className="quiz-link-input"
                />
                <button className="close-button" onClick={onRequestClose}>
                    Close
                </button>
            </div>
        </Modal>
    );
};

export default SuccessModal;
