import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import ContactForm from './components/ContactForm'
import LoginSignup from './components/LoginSignup'
import Dashboard from './pages/Dashboard/Dashboard'
import ExamAttendance from './pages/ExamAttendance/ExamAttendance'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function ProtectedRoute({ element }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return isAuthenticated ? element : null;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const { isAuthenticated, isLoading } = useAuth(); // Add isLoading
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && currentView === 'login') {
      setCurrentView('home');
    }
  }, [isAuthenticated, currentView]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  const navigateToAuth = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setCurrentView('login');
    }
  }
  
  const navigateToExam = () => {
    navigate('/exam-attendance');
  }

  const navigateToHome = () => {
    setCurrentView('home')
  }

  if (isLoading) {
    return (
      <div className="dashboard-loading" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/exam-attendance" element={<ProtectedRoute element={<ExamAttendance />} />} />
      <Route path="*" element={
        currentView === 'login' ? (
          <div className="app">
            <header className="header">
              <div className="nav-container">
                <div className="logo">
                  <h2>📝 ExamSpace</h2>
                </div>
                <nav className="nav-links">
                  <button 
                    className="nav-button" 
                    onClick={navigateToHome}
                  >
                    Back to Home
                  </button>
                </nav>
              </div>
            </header>
            <main className="main-content">
              <section className="auth-section">
                <LoginSignup />
              </section>
            </main>
          </div>
        ) : (
          <div className="app">
            <header className="header">
              <div className="nav-container">
                <div className="logo">
                  <h2>📝 ExamSpace</h2>
                </div>
                <nav className="nav-links">
                  <button 
                    className="nav-button" 
                    onClick={() => scrollToSection('features')}
                  >
                    Features
                  </button>
                  <button 
                    className="nav-button" 
                    onClick={() => scrollToSection('about')}
                  >
                    About
                  </button>
                  <button 
                    className="nav-button" 
                    onClick={() => scrollToSection('contact')}
                  >
                    Contact
                  </button>
                  {isAuthenticated && (
                    <button 
                      className="btn btn-secondary" 
                      onClick={navigateToExam}
                      style={{ marginLeft: '1rem' }}
                    >
                      Give Exam
                    </button>
                  )}
                </nav>
              </div>
            </header>

            <main className="main-content">
              <section className="hero">
                <div className="hero-content">
                  <h1>Welcome to ExamSpace</h1>
                  <p>Your comprehensive platform for online assessments and examinations</p>
                  <div className="hero-features">
                    <div className="feature-item">
                      <span className="feature-icon">📝</span>
                      <span>Online Exams</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">🔒</span>
                      <span>Secure Testing</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">📊</span>
                      <span>Instant Results</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <button 
                      className="btn btn-primary btn-large"
                      onClick={navigateToAuth}
                    >
                      {isAuthenticated ? 'Access Dashboard' : 'Get Started'}
                    </button>
                  </div>
                </div>
              </section>

              <section id="features" className="features">
                <div className="container">
                  <h2>Platform Features</h2>
                  <div className="features-grid">
                    <div className="feature-card">
                      <div className="feature-icon-large">🎯</div>
                      <h3>Smart Assessments</h3>
                      <p>Create and manage comprehensive online examinations with various question types and automated grading.</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon-large">🔐</div>
                      <h3>Secure Testing</h3>
                      <p>Advanced proctoring features with identity verification to ensure test integrity and prevent cheating.</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon-large">📈</div>
                      <h3>Assessment Analytics</h3>
                      <p>Track exam performance, statistical analysis, and generate detailed reports of test outcomes.</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon-large">⏱️</div>
                      <h3>Flexible Test Options</h3>
                      <p>Configure time limits, question randomization, and adaptive testing to suit your assessment needs.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="about" className="about">
                <div className="container">
                  <h2>About Our Platform</h2>
                  <div className="about-content">
                    <p>ExamSpace is designed to revolutionize the way institutions conduct online assessments with reliability and security.</p>
                    <p>Built with modern web technologies and security best practices, we provide a robust platform for creating, delivering, and analyzing assessments with precision.</p>
                  </div>
                </div>
              </section>

              <section id="contact" className="contact">
                <div className="container">
                  <h2>Contact Us</h2>
                  <div className="contact-content">
                    <ContactForm />
                  </div>
                </div>
              </section>
            </main>

            <footer className="footer">
              <div className="container">
                <p>&copy; 2025 ExamSpace. All rights reserved.</p>
              </div>
            </footer>
          </div>
        )
      } />
    </Routes>
  )
}

export default App;
