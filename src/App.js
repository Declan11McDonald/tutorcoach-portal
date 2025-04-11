import React, { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import TutorDashboard from './TutorDashboard';
import AdminTutorRequests from './AdminTutorRequests';
import Header from './Header';

function App() {
  const [userType, setUserType] = useState(null); // 'parent', 'tutor', 'admin'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentId, setStudentId] = useState(null); // For parent users

  // Updated to accept studentIdFromLogin
  const handleLogin = (type, studentIdFromLogin = null) => {
    console.log("LOGIN ROLE RECEIVED IN APP:", type, studentIdFromLogin);
    setUserType(type);
    setStudentId(studentIdFromLogin); // ✅ Capture student ID for parent login
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserType(null);
    setStudentId(null);
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <Header />
          {userType === 'admin' ? (
            <AdminTutorRequests onLogout={handleLogout} />
          ) : userType === 'tutor' ? (
            <TutorDashboard onLogout={handleLogout} />
          ) : (
            <Dashboard studentId={studentId} onLogout={handleLogout} />
          )}
        </>
      )}
    </div>
  );
}

export default App;



