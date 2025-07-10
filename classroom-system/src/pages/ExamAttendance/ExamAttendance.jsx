import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExamAttendance.css';

function ExamAttendance() {
    const [isLoading, setIsLoading] = useState(false);
    const [examData, setExamData] = useState(null);
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        roll: '',
        examName: '',
        examUid: '',
        passcode: ''
    });
    const [errors, setErrors] = useState({});
    const [userAnswers, setUserAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFullscreenExitWarning, setShowFullscreenExitWarning] = useState(false);
    const [readyForExam, setReadyForExam] = useState(false);
    const [mouseOutsideWindow, setMouseOutsideWindow] = useState(false);
    const [devToolsOpen, setDevToolsOpen] = useState(false);
    const [securityViolation, setSecurityViolation] = useState(false);
    const [violationType, setViolationType] = useState(null);
    const [warningCount, setWarningCount] = useState(0);
    const [notification, setNotification] = useState(null);
    const [notificationType, setNotificationType] = useState('info'); 
    const examContainerRef = useRef(null);
    const navigate = useNavigate();

    const showNotification = (message, type = 'info') => {
        setNotification(message);
        setNotificationType(type);
    };

    const enterFullscreen = useCallback(() => {
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { 
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { 
            element.msRequestFullscreen();
        }
        
        setIsFullscreen(true);
    }, []);

    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        setIsFullscreen(false);
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        if (examData && shuffledQuestions.length > 0) {
            setReadyForExam(true);
        }
    }, [examData, shuffledQuestions]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isCurrentlyFullscreen);
            
            if (examData && !isCurrentlyFullscreen && !readyForExam) {
                setShowFullscreenExitWarning(true);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [examData, readyForExam]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (examData && document.visibilityState === 'visible' && !document.fullscreenElement && !readyForExam) {
                setShowFullscreenExitWarning(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [examData, readyForExam]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (examData && (e.key === 'F11' || e.key === 'Escape' || 
                (e.altKey && e.key === 'Tab'))) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown, true);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [examData]);

    const handleSubmitExam = async () => {
        const allAnswered = shuffledQuestions.every(q => userAnswers[q.questionUid]);
        
        if (!allAnswered) {
            showNotification("Please answer all questions before submitting.", "warning");
            return;
        }
        
        try {
            setIsLoading(true);
            
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification("Authentication error. Please log in again.", "error");
                navigate('/');
                return;
            }
            
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            
            const decoded = JSON.parse(jsonPayload);
            
            const sortedQuestions = [...shuffledQuestions].sort((a, b) => {
                return examData.questions.findIndex(q => q.questionUid === a.questionUid) - 
                       examData.questions.findIndex(q => q.questionUid === b.questionUid);
            });
            
            const submissions = sortedQuestions.map(question => ({
                questionUid: question.questionUid,
                question: question.question,
                response: userAnswers[question.questionUid]
            }));
            
            const payload = {
                uid: decoded.userId,
                examUid: formData.examUid || examData.examId || examData.uid || examData._id,
                examName: examData.examName,
                submissions: submissions
            };
            
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/take-exam/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': import.meta.env.VITE_API_KEY
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification("Exam submitted successfully!", "success");
                
                if (isFullscreen) {
                    exitFullscreen();
                }
                
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                showNotification(data.message || "Failed to submit exam. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error submitting exam:", error);
            showNotification("Network error. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
        ...formData,
        [name]: value
        });
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.username.trim()) newErrors.username = "Username is required";
        if (!formData.roll.trim()) newErrors.roll = "Roll number is required";
        if (!formData.examName.trim()) newErrors.examName = "Exam name is required";
        if (!formData.examUid.trim()) newErrors.examUid = "Exam UID is required";
        if (!formData.passcode.trim()) newErrors.passcode = "Passcode is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                setIsLoading(true);
                
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
                
                const payload = {
                    uid: decoded.userId,
                    name: decoded.name,
                    email: decoded.email,
                    username: formData.username,
                    roll: formData.roll,
                    examUid: formData.examUid,
                    examPasscode: formData.passcode,
                    examName: formData.examName
                };
                
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/take-exam/register`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-API-Key': import.meta.env.VITE_API_KEY
                    },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();
                console.log("Response from server:", data);
                
                if (response.ok) {
                    const shuffled = shuffleArray(data.questions);
                    setShuffledQuestions(shuffled);
                    setExamData(data);
                    setIsLoading(false);
                } else {
                    setErrors({ server: data.message || "Failed to register for exam" });
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error fetching exam data:", error);
                setErrors({ network: "Network error. Please try again." });
                setIsLoading(false);
            }
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleAnswerSelect = (questionId, option) => {
        setUserAnswers({
            ...userAnswers,
            [questionId]: option
        });
        setShowWarning(false);
    };

    const goToNextQuestion = () => {
        const currentQuestion = shuffledQuestions[currentQuestionIndex];
        
        if (userAnswers[currentQuestion.questionUid]) {
            setShowWarning(false);
            if (currentQuestionIndex < shuffledQuestions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            }
        } else {
            setShowWarning(true);
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (examData && !readyForExam && isFullscreen) {
                const buffer = 5;
                const nearEdge = 
                    e.clientX <= buffer || 
                    e.clientX >= window.innerWidth - buffer ||
                    e.clientY <= buffer || 
                    e.clientY >= window.innerHeight - buffer;
                    
                if (nearEdge) {
                    setMouseOutsideWindow(true);
                    logSecurityEvent("Mouse near screen edge");
                } else {
                    setMouseOutsideWindow(false);
                }
            }
        };
        
        const handleMouseLeave = () => {
            if (examData && !readyForExam && isFullscreen) {
                setMouseOutsideWindow(true);
                logSecurityEvent("Mouse left exam window");
                setSecurityViolation(true);
                setViolationType('mouse');
                setWarningCount(prev => prev + 1);
            }
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [examData, readyForExam, isFullscreen]);

    const logSecurityEvent = (eventType) => {
        console.log(`Security event: ${eventType} at ${new Date().toISOString()}`);
    };

    useEffect(() => {
        const handleResize = () => {
            if (examData && !readyForExam && isFullscreen) {
                if (!document.fullscreenElement) {
                    setShowFullscreenExitWarning(true);
                    logSecurityEvent("Window resized, fullscreen exited");
                }
            }
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [examData, readyForExam, isFullscreen]);

    useEffect(() => {
        const detectDevTools = () => {
            const threshold = 200; // Increased from 160
            const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
            const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
            
            const isDevToolsOpen = 
                ((widthDiff > threshold) || (heightDiff > threshold)) &&
                (window.outerHeight !== window.screen.height);
            
            if (isDevToolsOpen && !devToolsOpen) {
                setDevToolsOpen(true);
                setSecurityViolation(true);
                setViolationType('devtools');
                setWarningCount(prev => prev + 1);
                logSecurityEvent("Developer tools detected");
            } else if (!isDevToolsOpen && devToolsOpen) {
                setDevToolsOpen(false);
                if (violationType === 'devtools') {
                    setSecurityViolation(false);
                    setViolationType(null);
                }
            }
        };

        if (examData && !readyForExam) {
            detectDevTools();
            
            const intervalId = setInterval(detectDevTools, 2000);
            
            return () => {
                clearInterval(intervalId);
            };
        }
    }, [examData, readyForExam, violationType, devToolsOpen]);

    if (notification) {
        return (
            <div className={`notification-overlay ${notificationType}`}>
                <div className="notification-container">
                    <div className="notification-icon">
                        {notificationType === 'success' && '✓'}
                        {notificationType === 'error' && '⚠️'}
                        {notificationType === 'warning' && '⚠️'}
                        {notificationType === 'info' && 'ℹ️'}
                    </div>
                    <div className="notification-message">
                        {notification}
                    </div>
                    <button 
                        className="notification-close"
                        onClick={() => setNotification(null)}
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    if (securityViolation) {
        return (
            <div className="security-violation-screen">
                <div className="violation-content">
                    <div className="violation-icon">⚠️</div>
                    <h2>Exam Security Violation</h2>
                    
                    {violationType === 'devtools' && (
                        <div className="violation-details">
                            <h3>Developer Tools Detected</h3>
                            <p>Browser developer tools are currently open. This is not allowed during exams.</p>
                            <p>This security violation has been logged. Warning count: {warningCount}</p>
                            
                            {warningCount > 3 && (
                                <div className="violation-warning">
                                    <p>Multiple violations detected. Continued violations may result in exam termination.</p>
                                </div>
                            )}
                            
                            <div className="violation-instructions">
                                <p><strong>To continue your exam:</strong></p>
                                <ol>
                                    <li>Close all developer tools (F12 or browser inspection tools)</li>
                                    <li>Close any other browser debugging tools</li>
                                    <li>Click the button below once tools are closed</li>
                                </ol>
                            </div>
                        </div>
                    )}
                    
                    {violationType === 'mouse' && (
                        <div className="violation-details">
                            <h3>Mouse Left Exam Window</h3>
                            <p>Your mouse cursor has been detected outside the exam window. This is not allowed during exams.</p>
                            <p>This security violation has been logged. Warning count: {warningCount}</p>
                            
                            {warningCount > 3 && (
                                <div className="violation-warning">
                                    <p>Multiple violations detected. Continued violations may result in exam termination.</p>
                                </div>
                            )}
                            
                            <div className="violation-instructions">
                                <p><strong>To continue your exam:</strong></p>
                                <ol>
                                    <li>Keep your mouse cursor within the exam window at all times</li>
                                    <li>Do not attempt to access other applications or browser tabs</li>
                                    <li>Click the button below to continue</li>
                                </ol>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        className="continue-exam-button"
                        onClick={() => {
                            const threshold = 160;
                            const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
                            const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
                            
                            const isCurrentlyOpen = 
                                (widthDiff > threshold) || 
                                (heightDiff > threshold) ||
                                (window.outerHeight < window.screen.height * 0.9 && window.innerHeight === window.outerHeight);
                            

                            if (!isCurrentlyOpen) {
                                setDevToolsOpen(false);
                                setSecurityViolation(false);
                                setViolationType(null);
                                setTimeout(() => {
                                    enterFullscreen();
                                }, 100);
                            } else {
                                showNotification("Please close developer tools before continuing. Make sure all browser developer tools are completely closed.", "error");
                            }
                        }}
                    >
                        Continue Exam
                    </button>
                    
                    {warningCount > 5 && (
                        <div className="terminate-exam-warning">
                            <p>Too many security violations detected. The exam may be invalidated.</p>
                            <button 
                                className="terminate-exam-button"
                                onClick={() => {
                                    exitFullscreen();
                                    navigate('/');
                                }}
                            >
                                Exit Exam
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    if (isLoading) {
        return (
        <div className="exam-loading">
            <div className="spinner"></div>
            <p>Loading exam questions...</p>
        </div>
        );
    }

    if (!examData) {
        return (
        <div className="exam-attendance-container">
            <header className="exam-header">
            <h1>Enter Exam Credentials</h1>
            <button className="back-button" onClick={handleBackToHome}>
                Back to Home
            </button>
            </header>
            
            <div className="exam-auth-form">
            <form onSubmit={handleSubmit}>
                {(errors.server || errors.network) && (
                <div className="error-container">
                    <p className="error-message">
                    {errors.server || errors.network}
                    </p>
                </div>
                )}
                
                <div className="form-group">
                <label htmlFor="username">Username / School ID</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={errors.username ? "error" : ""}
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
                </div>
                
                <div className="form-group">
                <label htmlFor="roll">Roll Number</label>
                <input
                    type="text"
                    id="roll"
                    name="roll"
                    value={formData.roll}
                    onChange={handleInputChange}
                    className={errors.roll ? "error" : ""}
                />
                {errors.roll && <span className="error-message">{errors.roll}</span>}
                </div>
                
                <div className="form-group">
                <label htmlFor="examName">Exam Name</label>
                <input
                    type="text"
                    id="examName"
                    name="examName"
                    value={formData.examName}
                    onChange={handleInputChange}
                    className={errors.examName ? "error" : ""}
                />
                {errors.examName && <span className="error-message">{errors.examName}</span>}
                </div>
                
                <div className="form-group">
                <label htmlFor="examUid">Exam UID</label>
                <input
                    type="text"
                    id="examUid"
                    name="examUid"
                    value={formData.examUid}
                    onChange={handleInputChange}
                    className={errors.examUid ? "error" : ""}
                />
                {errors.examUid && <span className="error-message">{errors.examUid}</span>}
                </div>
                
                <div className="form-group">
                <label htmlFor="passcode">Passcode</label>
                <input
                    type="text"
                    id="passcode"
                    name="passcode"
                    value={formData.passcode}
                    onChange={handleInputChange}
                    className={errors.passcode ? "error" : ""}
                />
                {errors.passcode && <span className="error-message">{errors.passcode}</span>}
                </div>
                
                <button type="submit" className="submit-button">Start Exam</button>
            </form>
            </div>
        </div>
        );
    }

    if (examData && shuffledQuestions.length > 0) {
        if (readyForExam) {
            return (
                <div className="exam-container">
                    <div className="fullscreen-prompt">
                        <h2>Start Exam in Fullscreen Mode</h2>
                        <p>This exam must be taken in fullscreen mode. Click the button below to start.</p>
                        <button 
                            className="start-exam-button"
                            onClick={() => {
                                enterFullscreen();
                                setReadyForExam(false);
                            }}
                        >
                            Enter Fullscreen & Start Exam
                        </button>
                    </div>
                </div>
            );
        }

        if (!isFullscreen) {
            return (
                <div className="fullscreen-exit-warning">
                    <div className="warning-content">
                        <h2>Fullscreen Mode Required</h2>
                        <p>This exam must be taken in fullscreen mode.</p>
                        <p>Please click the button below to return to fullscreen mode.</p>
                        <button 
                            className="return-fullscreen-button"
                            onClick={() => {
                                enterFullscreen();
                                setShowFullscreenExitWarning(false);
                            }}
                        >
                            Return to Fullscreen
                        </button>
                    </div>
                </div>
            );
        }
        
        const currentQuestion = shuffledQuestions[currentQuestionIndex];
        
        return (
            <div className="exam-container" ref={examContainerRef}>
                <header className="exam-header">
                    <h1>{examData.examName}</h1>
                    <div className="exam-info">
                        <div className="exam-progress">
                            Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
                        </div>
                    </div>
                </header>
                
                <div className="question-container">
                    <div className="question">
                        <h3>{currentQuestion.question}</h3>
                        
                        <div className="options">
                            <div 
                                className={`option ${userAnswers[currentQuestion.questionUid] === 'A' ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(currentQuestion.questionUid, 'A')}
                            >
                                <span className="option-label">A:</span>
                                <span className="option-text">{currentQuestion.optionA}</span>
                            </div>
                            
                            <div 
                                className={`option ${userAnswers[currentQuestion.questionUid] === 'B' ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(currentQuestion.questionUid, 'B')}
                            >
                                <span className="option-label">B:</span>
                                <span className="option-text">{currentQuestion.optionB}</span>
                            </div>
                            
                            <div 
                                className={`option ${userAnswers[currentQuestion.questionUid] === 'C' ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(currentQuestion.questionUid, 'C')}
                            >
                                <span className="option-label">C:</span>
                                <span className="option-text">{currentQuestion.optionC}</span>
                            </div>
                            
                            <div 
                                className={`option ${userAnswers[currentQuestion.questionUid] === 'D' ? 'selected' : ''}`}
                                onClick={() => handleAnswerSelect(currentQuestion.questionUid, 'D')}
                            >
                                <span className="option-label">D:</span>
                                <span className="option-text">{currentQuestion.optionD}</span>
                            </div>
                        </div>
                        
                        {showWarning && (
                            <div className="answer-warning">
                                You need to select one answer to continue
                            </div>
                        )}
                    </div>
                    
                    <div className="navigation-buttons">
                        <button 
                            onClick={goToPreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="exam-nav-button"
                        >
                            Previous
                        </button>
                        
                        {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                            <button onClick={goToNextQuestion} className="exam-nav-button">
                                Next
                            </button>
                        ) : (
                            <button 
                                onClick={handleSubmitExam} 
                                className="submit-exam-button"
                                disabled={!userAnswers[currentQuestion.questionUid]}
                            >
                                Submit Exam
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (showFullscreenExitWarning) {
        return (
            <div className="fullscreen-exit-warning">
                <div className="warning-content">
                    <h2>Security Warning</h2>
                    {mouseOutsideWindow && (
                        <div className="security-alert">
                            <p className="warning-text">⚠️ Mouse moved outside exam window!</p>
                            <p>Please keep your mouse inside the exam area.</p>
                        </div>
                    )}
                    {devToolsOpen && (
                        <div className="security-alert">
                            <p className="warning-text">⚠️ Developer tools detected!</p>
                            <p>Using browser developer tools during the exam is not allowed.</p>
                        </div>
                    )}
                    {!mouseOutsideWindow && !devToolsOpen && (
                        <p>This exam must be taken in fullscreen mode.</p>
                    )}
                    <p>Please click the button below to return to fullscreen mode and continue the exam.</p>
                    <button 
                        className="return-fullscreen-button"
                        onClick={() => {
                            enterFullscreen();
                            setShowFullscreenExitWarning(false);
                            setMouseOutsideWindow(false);
                        }}
                    >
                        Return to Fullscreen
                    </button>
                </div>
            </div>
        );
    }

    return null; 
}

export default ExamAttendance;