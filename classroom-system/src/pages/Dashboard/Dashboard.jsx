import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import ExamSection from '../../components/ExamSection/ExamSection'
import ResultSection from '../../components/ResultSection/ResultSection'
import ProfileSection from '../../components/ProfileSection/ProfileSection'
import './Dashboard.css'

function Dashboard() {
  const { logout } = useAuth()
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('exams')

  const getUserDataFromToken = () => {
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
      return {
        name: decoded.name || null,
        email: decoded.email || null,
        userId: decoded.userId || null
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    const tokenData = getUserDataFromToken();
    
    if (tokenData && tokenData.name) {
      setUserData(tokenData);
    } else {
      const userInfo = localStorage.getItem('user')
      if (userInfo) {
        try {
          setUserData(JSON.parse(userInfo))
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    }
    
    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    logout()
  }

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <h2>📝 ExamSpace</h2>
        </div>
        <div className="dashboard-user">
          <span className="user-greeting">
            Welcome {userData?.name || 'User'}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <ul>
              <li className={activeSection === 'exams' ? 'active' : ''}>
                <button onClick={() => setActiveSection('exams')}>
                  <span className="nav-icon">📝</span> Exams
                </button>
              </li>
              <li className={activeSection === 'results' ? 'active' : ''}>
                <button onClick={() => setActiveSection('results')}>
                  <span className="nav-icon">🏆</span> Results
                </button>
              </li>
              <li className={activeSection === 'profile' ? 'active' : ''}>
                <button onClick={() => setActiveSection('profile')}>
                  <span className="nav-icon">👤</span> Profile
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="dashboard-main">
          {activeSection === 'exams' && <ExamSection />}

          {activeSection === 'results' && <ResultSection />}
          
          {activeSection === 'profile' && <ProfileSection userData={userData} />}
        </main>
      </div>
    </div>
  )
}

export default Dashboard