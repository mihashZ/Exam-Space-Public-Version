import { useState, useEffect, useRef } from 'react';
import './ExamSection.css';

function ViewResponsesModal({ isVisible, exam, onClose }) {
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [examInfo, setExamInfo] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const printRefs = useRef({});

  useEffect(() => {
    if (!isVisible || !exam) return;
    setIsLoading(true);
    setError('');
    setOpenIndex(null);
    const fetchResponses = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/take-exam/responses?examUid=${encodeURIComponent(exam.examId)}&examName=${encodeURIComponent(exam.title)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': import.meta.env.VITE_API_KEY,
            }
          }
        );
        const data = await response.json();
        if (data.status === 'success') {
          setResponses(data.responses || []);
          setExamInfo({ examName: data.examName, totalSubmissions: data.totalSubmissions });
        } else {
          setError(data.message || 'Failed to fetch responses');
        }
      } catch {
        setError('Network error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResponses();
  }, [isVisible, exam]);

  const handlePrint = (idx) => {
    const printContent = printRefs.current[idx];
    if (!printContent) return;
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write(`
      <html>
        <head>
          <title>Student Response</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 6px; }
            th { background: #f0f0f0; }
            h2 { margin-bottom: 0; }
            .info { margin-bottom: 16px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handlePrintAll = () => {
    if (!responses.length) return;
    let allHtml = '';
    responses.forEach((resp, idx) => {
      const content = printRefs.current[idx];
      if (content) {
        allHtml += `<div style="page-break-after: always;">${content.innerHTML}</div>`;
      }
    });
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write(`
      <html>
        <head>
          <title>All Student Responses</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 6px; }
            th { background: #f0f0f0; }
            h2 { margin-bottom: 0; }
            .info { margin-bottom: 16px; }
            .student-break { page-break-after: always; }
          </style>
        </head>
        <body>
          ${allHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!isVisible) return null;

  return (
    <div className="question-editor-overlay" style={{ zIndex: 1000 }}>
      <div className="responses-modal">
        <div className="responses-modal-header">
          <h3 className="responses-modal-title">Exam Responses</h3>
          <button className="responses-modal-close" onClick={onClose} title="Close">✕</button>
        </div>
        <div className="responses-modal-content">
          {isLoading ? (
            <div className="loading-indicator" style={{ textAlign: 'center', margin: '40px 0' }}>
              <div className="spinner"></div>
              <span style={{ color: '#4e73df', fontWeight: 600, fontSize: 18 }}>Loading...</span>
            </div>
          ) : error ? (
            <div style={{ color: 'red', margin: 16, textAlign: 'center', fontWeight: 600 }}>{error}</div>
          ) : (
            <>
              <div className="responses-summary">
                <div>
                  <div className="responses-summary-title">{examInfo?.examName}</div>
                  <div className="responses-summary-sub">
                    <strong>Total Submissions:</strong> {examInfo?.totalSubmissions}
                  </div>
                </div>
                {responses.length > 0 && (
                  <button className="responses-export-btn" onClick={handlePrintAll}>
                    <i className="fa fa-download" style={{ marginRight: 8 }}></i>
                    Export All Responses
                  </button>
                )}
              </div>
              {responses.length === 0 ? (
                <div className="responses-empty">No responses found.</div>
              ) : (
                <div>
                  {responses.map((resp, idx) => (
                    <div
                      key={resp.email + idx}
                      className={`response-card${openIndex === idx ? ' open' : ''}`}
                    >
                      <div
                        className={`response-card-header${openIndex === idx ? ' open' : ''}`}
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                      >
                        <span className="response-card-info">
                          <span className="response-card-name">{resp.name}</span>
                          <span className="response-card-details">
                            &nbsp;|&nbsp;{resp.email} &nbsp;|&nbsp;{resp.username} &nbsp;|&nbsp;Roll: {resp.roll}
                            &nbsp;|&nbsp;Marks: <span className="response-card-marks">{resp.marksObtained}</span> / {resp.fullMarks}
                            &nbsp;|&nbsp;Correct: <span style={{ color: 'green', fontWeight: 'bold' }}>
                              {resp.responses.filter(q => q.correctAnswer === q.studentAnswer).length}
                            </span>
                            &nbsp;|&nbsp;Wrong: <span style={{ color: 'red', fontWeight: 'bold' }}>
                              {resp.responses.filter(q => q.correctAnswer !== q.studentAnswer).length}
                            </span>
                            &nbsp;|&nbsp;Submitted: {new Date(resp.submissionTime).toLocaleString()}
                          </span>
                        </span>
                        <button
                          className="response-card-btn"
                          onClick={e => {
                            e.stopPropagation();
                            handlePrint(idx);
                          }}
                        >
                          <i className="fa fa-print" style={{ marginRight: 6 }}></i>
                          Print / Export PDF
                        </button>
                        <span
                          className={`response-card-arrow${openIndex === idx ? ' open' : ''}`}
                        >
                          ▶
                        </span>
                      </div>
                      <div style={{ display: 'none' }}>
                        <div ref={el => (printRefs.current[idx] = el)}>
                          <h2>Exam: {examInfo?.examName}</h2>
                          <div className="info">
                            <div><strong>Name:</strong> {resp.name}</div>
                            <div><strong>Email:</strong> {resp.email}</div>
                            <div><strong>Username:</strong> {resp.username}</div>
                            <div><strong>Roll:</strong> {resp.roll}</div>
                            <div><strong>Marks:</strong> {resp.marksObtained} / {resp.fullMarks}</div>
                            <div><strong>Submitted:</strong> {new Date(resp.submissionTime).toLocaleString()}</div>
                            <div>
                              <strong>Total Correct:</strong> {
                                resp.responses.filter(q => q.correctAnswer === q.studentAnswer).length
                              }
                            </div>
                            <div>
                              <strong>Total Wrong:</strong> {
                                resp.responses.filter(q => q.correctAnswer !== q.studentAnswer).length
                              }
                            </div>
                          </div>
                          <table>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Question</th>
                                <th>Correct</th>
                                <th>Student</th>
                              </tr>
                            </thead>
                            <tbody>
                              {resp.responses.map((q, qidx) => (
                                <tr key={q.questionUid}>
                                  <td>{qidx + 1}</td>
                                  <td>{q.question}</td>
                                  <td>{q.correctAnswer} - {q.correctAnswerText}</td>
                                  <td style={{ color: q.correctAnswer === q.studentAnswer ? 'green' : 'red' }}>
                                    {q.studentAnswer} - {q.studentAnswerText}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {openIndex === idx && (
                        <div className="response-table-container">
                          <table className="response-table">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Question</th>
                                <th>Correct</th>
                                <th>Student</th>
                              </tr>
                            </thead>
                            <tbody>
                              {resp.responses.map((q, qidx) => (
                                <tr key={q.questionUid}>
                                  <td>{qidx + 1}</td>
                                  <td>{q.question}</td>
                                  <td>
                                    <span className="correct">{q.correctAnswer} - {q.correctAnswerText}</span>
                                  </td>
                                  <td>
                                    <span className={`student-answer ${q.correctAnswer === q.studentAnswer ? 'correct' : 'incorrect'}`}>
                                      {q.studentAnswer} - {q.studentAnswerText}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewResponsesModal;