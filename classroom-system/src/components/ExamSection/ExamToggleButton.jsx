import { useState } from 'react';
import './ExamSection.css';

function ExamToggleButton({ exam, onToggle, onToggleResultPublish }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResultLoading, setIsResultLoading] = useState(false);

  const handleToggleExamStatus = async () => {
    setIsLoading(true);
    
    try {
      const newStatus = exam.state === 'ON' ? 'OFF' : 'ON';
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/exam/${exam.examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({
          state: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error toggling exam status: ${response.status}`);
      }
      
      onToggle(exam, newStatus);
    } catch {
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleResultPublish = async () => {
    setIsResultLoading(true);
    
    try {
      const newResultPublish = exam.resultPublish === 'YES' ? 'NO' : 'YES';
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/exam/${exam.examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({
          resultPublish: newResultPublish
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error toggling result publish: ${response.status}`);
      }
      
      onToggleResultPublish(exam, newResultPublish);
    } catch {
      return;
    } finally {
      setIsResultLoading(false);
    }
  };

  return (
    <div className="toggle-container">
      <div className="toggle-group">
        <div className="toggle-item">
          <span className="toggle-title">Exam Status</span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={exam.state === 'ON'} 
              onChange={handleToggleExamStatus}
              disabled={isLoading}
            />
            <span className="slider round"></span>
            <span className="status-label">{exam.state === 'ON' ? 'ON' : 'OFF'}</span>
          </label>
        </div>
        
        <div className="toggle-item">
          <span className="toggle-title">Result Publish</span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={exam.resultPublish === 'YES'} 
              onChange={handleToggleResultPublish}
              disabled={isResultLoading}
            />
            <span className="slider round"></span>
            <span className="status-label">{exam.resultPublish === 'YES' ? 'YES' : 'NO'}</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default ExamToggleButton;