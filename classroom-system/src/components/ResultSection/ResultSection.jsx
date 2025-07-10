import { useState, useEffect } from 'react';
import './ResultSection.css';

function ResultSection() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setIsLoading(true);
    setError('');
    
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
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/take-exam/user-summary?uid=${decoded.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY,
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setResults(data.examDetails || []);
      } else {
        setError(data.message || 'Failed to fetch results');
      }
    } catch {
      setError('Network error occurred while fetching results');
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return '#28a745'; 
    if (percentage >= 60) return '#ffc107'; 
    if (percentage >= 40) return '#fd7e14'; 
    return '#dc3545'; 
  };

  return (
    <div className="dashboard-section">
      <h2>Your Results</h2>
      <div className="results-container">
        {isLoading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading your results...</p>
          </div>
        ) : error ? (
          <div className="results-error">
            <p style={{ color: '#dc3545', fontWeight: '600' }}>{error}</p>
            <button onClick={fetchResults} className="retry-btn">Retry</button>
          </div>
        ) : results.length > 0 ? (
          <div className="results-list">
            {results.map(result => (
              <div key={result.resultUid} className="result-card">
                <div className="result-header">
                  <div className="exam-info">
                    <h3>{result.examName}</h3>
                    <div className="student-info">
                      <span className="student-name">{result.name}</span>
                    </div>
                  </div>
                </div>
                <div className="result-details">
                  <div className="result-item">
                    <span className="result-label">Username:</span>
                    <span className="student-username">{result.username}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Score:</span>
                    <span className="result-value">{result.marksObtained}/{result.fullMarks}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Percentage:</span>
                    <span className="result-value" style={{ color: getGradeColor(result.percentage) }}>
                      {result.percentage}%
                    </span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Correct Answers:</span>
                    <span className="result-value" style={{ color: '#28a745' }}>
                      {result.totalRightAnswers}
                    </span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Wrong Answers:</span>
                    <span className="result-value" style={{ color: '#dc3545' }}>
                      {result.totalWrongAnswers}
                    </span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Roll:</span>
                    <span className="result-value">{result.roll}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Email:</span>
                    <span className="result-value">{result.email}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Submitted:</span>
                    <span className="result-value">
                      {new Date(result.submissionTime).toLocaleDateString()} at {new Date(result.submissionTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                <details className="result-responses">
                  <summary>View Detailed Responses</summary>
                  <div className="responses-table">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Question</th>
                          <th>Your Answer</th>
                          <th>Correct Answer</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.responses.map((response, index) => (
                          <tr key={response.questionUid}>
                            <td>{index + 1}</td>
                            <td>{response.question}</td>
                            <td>
                              <span className={response.correctAnswer === response.studentAnswer ? 'correct-answer' : 'wrong-answer'}>
                                {response.studentAnswer} - {response.studentAnswerText}
                              </span>
                            </td>
                            <td>
                              <span className="correct-answer">
                                {response.correctAnswer} - {response.correctAnswerText}
                              </span>
                            </td>
                            <td>
                              <span className={`result-status ${response.correctAnswer === response.studentAnswer ? 'correct' : 'incorrect'}`}>
                                {response.correctAnswer === response.studentAnswer ? '✓' : '✗'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>
            ))}
          </div>
        ) : (
          <div className="results-empty">
            <p>No results to display yet.</p>
            <p>Take some exams to see your results here!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultSection;