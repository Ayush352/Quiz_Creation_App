import React, { useState, useEffect } from 'react';
import './Analytics.css';
import { useNavigate, Link } from 'react-router-dom';
import CreateQuizModal from './CreateQuizModal';
import axios from 'axios'; // Make sure to install axios if not already
import EditModal from './EditModal';

const Analytics = ({onLogout}) => {
  const [isModal1Open, setIsModal1Open] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemType, setItemType] = useState(''); // 'quiz' or 'poll'
  const [quizzesAndPolls, setQuizzesAndPolls] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState('')
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch quizzes and polls from the database
    const fetchData = async () => {
      try {
        const quizzesResponse = await axios.get('https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com/users/quizzes'); // Update with your endpoint
        const pollsResponse = await axios.get('https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com/users/polls'); // Update with your endpoint

        // Combine quizzes and polls data
        const combinedData = [
          ...quizzesResponse.data.data.map(item => ({ ...item, type: 'quiz' })),
          ...pollsResponse.data.data.map(item => ({ ...item, type: 'poll' })),
        ];

        // Sort combined data by creation date in descending order
        combinedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setQuizzesAndPolls(combinedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const openConfirmModal = (itemId, type) => {
    setItemToDelete(itemId);
    setItemType(type);
    setIsConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (itemType === 'quiz') {
        await axios.delete(`https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com/users/deleteQuiz/${itemToDelete}`); // Update with your endpoint
      } else if (itemType === 'poll') {
        await axios.delete(`https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com/users/deletePoll/${itemToDelete}`); // Update with your endpoint
      }
      setQuizzesAndPolls(quizzesAndPolls.filter(item => item._id !== itemToDelete));
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-GB', options);
    return formattedDate.replace(/(\w{3}) (\d{4})/, '$1, $2');
  };

  const handleLogout = () => {
    onLogout(); 
    navigate('/login'); 
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2 className="sidebar-heading">QUIZZIE</h2>
        <div className="sidebar-container">
          <button className="sidebar-button" onClick={() => handleNavigation('/dashboard')}>Dashboard</button>
          <button className="sidebar-button" onClick={() => handleNavigation('/analytics')}>Analytics</button>
          <button className="sidebar-button" onClick={() => {setIsModal1Open(true); setIsEdit(false); setQuizTitle('')} }>Create Quiz</button>
          {isEdit===false ? (<CreateQuizModal
            isOpen={isModal1Open}
            onRequestClose={() => setIsModal1Open(false)}
            quizTitle={quizTitle}
            setQuizTitle={setQuizTitle}
          />):
          ((<EditModal
            isOpen={isModal1Open}
            onRequestClose={() => setIsModal1Open(false)}
            quizTitle={quizTitle}
            setQuizTitle={setQuizTitle}
            isEdit={isEdit}
            editId={editId}
          />))}
          <div className="sidebar-footer">
          <div className="line" />
          <p className="logout" onClick={handleLogout}>Logout</p>
        </div>
        </div>
      </div>
      <div className="content-area">
        <div className='quizHeading'>Quiz and Poll Analysis</div>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Title</th>
              <th>Created on</th>
              <th>Impressions</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {quizzesAndPolls.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.quizTitle || item.pollTitle}</td> {/* Adjust based on your data */}
                <td>{formatDate(item.createdAt)}</td>
                <td>{item.impressions}</td>
                <td className="actions">
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%238000ff' d='M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1m-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71m10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z'/%3E%3C/svg%3E"
                    alt="Edit"
                    className="action-icon"
                    onClick={()=>{
                      setIsEdit(true);
                      setEditId(item._id)
                      setIsModal1Open(true);
                    }}
                  />
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23ff0000' d='M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z'/%3E%3C/svg%3E"
                    alt="Delete"
                    className="action-icon"
                    onClick={() => openConfirmModal(item._id, item.type)}
                  />
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23008000' d='M17 22q-1.25 0-2.125-.875T14 19q0-.15.075-.7L7.05 14.2q-.4.375-.925.588T5 15q-1.25 0-2.125-.875T2 12t.875-2.125T5 9q.6 0 1.125.213t.925.587l7.025-4.1q-.05-.175-.062-.337T14 5q0-1.25.875-2.125T17 2t2.125.875T20 5t-.875 2.125T17 8q-.6 0-1.125-.213T14.95 7.2l-7.025 4.1q.05.175.063.338T8 12t-.012.363t-.063.337l7.025 4.1q.4-.375.925-.587T17 16q1.25 0 2.125.875T20 19t-.875 2.125T17 22'/%3E%3C/svg%3E"
                    alt="View"
                    className="action-icon"
                    onClick={() => handleNavigation(`/analysis/${item._id}`)}
                  />
                  {item.type==="quiz" ? 
                  (<Link to={`/questionAnalysis/${item._id}`} className="analysis-link">
                Question Wise Analysis
              </Link>)
              :
              (<Link to={`/pollAnalysis/${item._id}`} className="analysis-link">
                Question Wise Analysis
              </Link>)
              }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isConfirmModalOpen && (
        <div className="confirm-modal">
          <div className="confirm-modal-content">
            <div className="deleteModalHeading">
              <div >Are you Confirm you</div>
              <div >want to delete ?</div>
            </div>
            <div className="deleteButtons">
              <div className='confirm' onClick={handleDelete}>Confirm Delete</div>
              <button onClick={() => setIsConfirmModalOpen(false)}>Cancel</button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
