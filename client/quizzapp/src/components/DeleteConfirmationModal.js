// DeleteConfirmationModal.js
import React from 'react';
import './DeleteConfirmationModal.css'; // Create your CSS for the modal

const DeleteConfirmationModal = ({ isOpen, onRequestClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Are you sure you want to delete?</h2>
        <div className="modal-buttons">
          <button className="cancel-button" onClick={onRequestClose}>Cancel</button>
          <button className="confirm-button" onClick={onConfirm}>Confirm Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
