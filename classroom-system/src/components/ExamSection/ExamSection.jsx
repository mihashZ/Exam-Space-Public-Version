import { useState, useEffect } from 'react';
import './ExamSection.css';
import QuestionGenerator from './QuestionGenerator';
import CreateExamForm from './CreateExamForm';
import QuestionListEditor from './QuestionListEditor';
import EditExamForm from './EditExamForm';
import ExamToggleButton from './ExamToggleButton';
import ViewResponsesModal from './ViewResponsesModal';

function ExamSection() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exams, setExams] = useState([]);
  const [sharedExams, setSharedExams] = useState([]);
  const [isLoadingSharedExams, setIsLoadingSharedExams] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState(null);
  const [showQuestionListEditor, setShowQuestionListEditor] = useState(false);
  const [activeTab, setActiveTab] = useState('myExams');
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [examForResponses, setExamForResponses] = useState(null);

  useEffect(() => {
    fetchExams();
    fetchSharedExams();
  }, []);

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      return decoded.userId || decoded.sub; 
    } catch {
      return null;
    }
  };

  const getUserEmailFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      return decoded.email || null; 
    } catch {
      return null;
    }
  };

  const fetchExams = async () => {
    setIsRefreshing(true);
    
    try {
      const userId = getUserIdFromToken();
      
      if (!userId) {
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/exam/my-exams/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching exams: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.exams)) {
        const formattedExams = data.exams.map(exam => ({
          id: exam.id,
          examId: exam.examId,
          title: exam.examName,
          description: `Status: ${exam.state}, Marks: ${exam.marks}`,
          passcode: exam.examPasscode,
          state: exam.state,
          createdAt: exam.createdAt,
          sharing: exam.sharing,
          resultPublish: exam.resultPublish 
        }));
        setExams(formattedExams);
      }
    } catch {
      return;
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchSharedExams = async () => {
    setIsLoadingSharedExams(true);
    
    try {
      const userEmail = getUserEmailFromToken();
      
      if (!userEmail) {
        console.error('User email not found in token');
        setIsLoadingSharedExams(false);
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/exam/shared-exams?email=${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching shared exams: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.exams)) {
        const formattedSharedExams = data.exams.map(exam => ({
          id: exam.examId,
          examId: exam.examId,
          title: exam.examName,
          description: `Status: ${exam.status}, Marks: ${exam.marks}`,
          duration: exam.duration,
          state: exam.status, 
          createdAt: exam.createdAt,
          sharing: exam.sharing,
          passcode: exam.examPasscode,
          creatorName: exam.creatorName,
          creatorEmail: exam.creatorEmail
        }));
        
        setSharedExams(formattedSharedExams);
      }
    } catch {
      return;
    } finally {
      setIsLoadingSharedExams(false);
    }
  };

  const handleCreateExam = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  const handleExamCreated = () => {
    fetchExams();
    setShowCreateForm(false);
  };

  const handleEditExam = (exam) => {
    setCurrentExam(exam);
    setShowEditForm(true);
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setCurrentExam(null);
  };

  const handleUpdateExam = () => {
    fetchExams();
    fetchSharedExams(); 
    handleCancelEdit();
  };

  const handleToggleExamStatus = (exam, newStatus) => {
    const updatedExams = exams.map(e => {
      if (e.examId === exam.examId) {
        return {
          ...e,
          state: newStatus,
          description: `Status: ${newStatus}, Marks: ${e.description.replace(/^Status: .+?, Marks: (.+?)$/, '$1')}`
        };
      }
      return e;
    });
    
    const updatedSharedExams = sharedExams.map(e => {
      if (e.examId === exam.examId) {
        return {
          ...e,
          state: newStatus,
          description: `Status: ${newStatus}, Marks: ${e.description.replace(/^Status: .+?, Marks: (.+?)$/, '$1')}`
        };
      }
      return e;
    });
    
    setExams(updatedExams);
    setSharedExams(updatedSharedExams);
  };

  const handleToggleResultPublish = (exam, newResultPublish) => {
    const updatedExams = exams.map(e => {
      if (e.examId === exam.examId) {
        return {
          ...e,
          resultPublish: newResultPublish
        };
      }
      return e;
    });
    setExams(updatedExams);
  };

  const handleEditQuestions = (exam) => {
    setSelectedExamForQuestions(exam);
    setShowQuestionEditor(true);
  };

  const handleCancelQuestionEditor = () => {
    setShowQuestionEditor(false);
    setSelectedExamForQuestions(null);
  };

  const handleEditExistingQuestions = (exam) => {
    setSelectedExamForQuestions(exam);
    setShowQuestionListEditor(true);
  };

  const handleCloseQuestionEditor = () => {
    setShowQuestionListEditor(false);
    setSelectedExamForQuestions(null);
  };

  const handleDeleteExam = async (exam) => {
    const deleteConfirmation = prompt(`Type "DELETE" (in all capitals) to confirm that you want to delete the exam "${exam.title}"`);
    
    if (deleteConfirmation !== "DELETE") {
      alert("Exam deletion cancelled. You must type DELETE exactly to proceed.");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete the exam "${exam.title}" and all its questions? This action cannot be undone.`)) {
      return; 
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/exam/${exam.examId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting exam: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        if (activeTab === 'myExams') {
          setExams(exams.filter(e => e.examId !== exam.examId));
        } else {
          setSharedExams(sharedExams.filter(e => e.examId !== exam.examId));
        }
        
        alert(data.message || 'Exam deleted successfully');
      } else {
        throw new Error(data.message || 'Failed to delete exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert(`Failed to delete exam: ${error.message}`);
    }
  };

  const renderExamCard = (exam, isShared = false) => {
    return (
      <div key={exam.examId} className="exam-card">
        <h3>{exam.title}</h3>
        <div className="exam-info-grid">
          <span className="exam-uid">
            <strong>Exam ID:</strong> {exam.examId}
          </span>
          <span className="exam-marks">
            <strong>Marks:</strong> {exam.description.replace(/^Status: .+?, Marks: (.+?)$/, '$1')}
          </span>
          <span className="exam-status">
            <strong>Status:</strong> {exam.state}
          </span>
          <span className="exam-created">
            <strong>Created:</strong> {new Date(exam.createdAt).toLocaleString()}
          </span>
          <span className="exam-passcode">
            <strong>Passcode:</strong> {exam.passcode || <em>None</em>}
          </span>
          {exam.sharing && (
            <span className="exam-sharing">
              <strong>Shared with:</strong> {exam.sharing.split(',').map(email => email.trim()).join(', ')}
            </span>
          )}
        </div>
        <div className="exam-actions">
          <div className="toggle-group">
            <ExamToggleButton 
              exam={exam}
              onToggle={handleToggleExamStatus}
              onToggleResultPublish={handleToggleResultPublish}
            />
          </div>
          <button 
            className="edit-button"
            onClick={() => handleEditExam(exam)}
          >
            <i className="edit-icon">✏️</i> Edit Exam
          </button>
          <button 
            className="edit-button question-button"
            onClick={() => handleEditQuestions(exam)}
          >
            <i className="edit-icon">➕</i> Generate Questions
          </button>
          <button 
            className="edit-button edit-question-button"
            onClick={() => handleEditExistingQuestions(exam)}
          >
            <i className="edit-icon">📝</i> Edit Questions
          </button>
          <button
            className="edit-button"
            style={{ background: '#4e73df', color: '#fff' }}
            onClick={() => {
              setExamForResponses(exam);
              setShowResponsesModal(true);
            }}
          >
            <i className="edit-icon">📊</i> View Responses
          </button>
          {!isShared && (
            <button 
              className="edit-button delete-button"
              onClick={() => handleDeleteExam(exam)}
            >
              <i className="delete-icon">🗑️</i> Delete
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Exams</h2>
        <button 
          className="btn btn-primary"
          onClick={handleCreateExam}
        >
          Create Exam
        </button>
      </div>
      
      {showCreateForm && (
        <CreateExamForm 
          onSubmit={handleExamCreated} 
          onCancel={handleCancelCreate}
          getUserId={getUserIdFromToken}
        />
      )}
      
      {showEditForm && currentExam && (
        <EditExamForm
          exam={currentExam}
          onCancel={handleCancelEdit}
          onUpdate={handleUpdateExam}
        />
      )}
      
      {showQuestionEditor && selectedExamForQuestions && (
        <QuestionGenerator
          isVisible={showQuestionEditor}
          examData={selectedExamForQuestions}
          onClose={handleCancelQuestionEditor}
          getUserId={getUserIdFromToken}
        />
      )}
      
      {showQuestionListEditor && selectedExamForQuestions && (
        <QuestionListEditor
          isVisible={showQuestionListEditor}
          examData={selectedExamForQuestions}
          onClose={handleCloseQuestionEditor}
          getUserId={getUserIdFromToken}
        />
      )}
      
      {showResponsesModal && examForResponses && (
        <ViewResponsesModal
          isVisible={showResponsesModal}
          exam={examForResponses}
          onClose={() => setShowResponsesModal(false)}
        />
      )}
      
      <div className="exam-tabs">
        <button 
          className={`tab-button ${activeTab === 'myExams' ? 'active' : ''}`}
          onClick={() => setActiveTab('myExams')}
        >
          My Exams
        </button>
        <button 
          className={`tab-button ${activeTab === 'sharedExams' ? 'active' : ''}`}
          onClick={() => setActiveTab('sharedExams')}
        >
          Shared With Me
        </button>
      </div>
      
      <div className="exams-container">
        {activeTab === 'myExams' && (
          <>
            {isRefreshing ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading exams...</p>
              </div>
            ) : exams.length > 0 ? (
              <div className="exams-list">
                {exams.map(exam => renderExamCard(exam))}
              </div>
            ) : (
              <div className="exams-empty">
                <p>No exams available at the moment.</p>
                <button 
                  className="btn btn-primary"
                  onClick={fetchExams}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'sharedExams' && (
          <>
            {isLoadingSharedExams ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading shared exams...</p>
              </div>
            ) : sharedExams.length > 0 ? (
              <div className="exams-list">
                {sharedExams.map(exam => renderExamCard(exam, true))}
              </div>
            ) : (
              <div className="exams-empty">
                <p>No shared exams available at the moment.</p>
                <button 
                  className="btn btn-primary"
                  onClick={fetchSharedExams}
                  disabled={isLoadingSharedExams}
                >
                  {isLoadingSharedExams ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ExamSection;