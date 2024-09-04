import React from 'react';
import './Snackbar.css'; // Create or update this CSS file for styling

const Snackbar = ({ isOpen, onClose }) => {
    return (
        <div className={`snackbar ${isOpen ? 'show' : ''}`}>
            <div className="snackbar-content">
                <div className="icon-check"></div>
                <p>Link copied to Clipboard</p>
                <div className="close-snackbar" onClick={onClose}>×</div>
            </div>
        </div>
    );
};

export default Snackbar;
