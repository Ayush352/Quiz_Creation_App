import React, { useState } from 'react';
import Modal from 'react-modal';
import './SuccessModal.css'; // Create or update this CSS file for styling
import Snackbar from './Snackbar'; // Import Snackbar component

const SuccessModal = ({ isOpen, onRequestClose, url }) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url)
            .then(() => {
                setSnackbarOpen(true);
                setTimeout(() => {
                    setSnackbarOpen(false);
                }, 3000); // Set duration according to your preference
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Quiz Created Successfully"
            className="success-modal"
            overlayClassName="success-modal-overlay"
            ariaHideApp={false}
        >
            <div className="success-modal-content">
                <div className="close-button" onClick={onRequestClose}>×</div>
                <h2>Congrats your Quiz is Published!</h2>
                <div className="url-container">
                    <input 
                        type="text" 
                        value="Your link is here" 
                        readOnly 
                        className="url-input" 
                        onClick={handleCopy} 
                    />
                </div>
                <button onClick={handleCopy} className="share-button">Share</button>
            </div>
            <Snackbar isOpen={snackbarOpen} onClose={handleCloseSnackbar} />
        </Modal>
    );
};

export default SuccessModal;
