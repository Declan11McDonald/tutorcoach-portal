import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Header from './Header';

function Login({ onLogin, switchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("No user data found.");
        return;
      }

      const userData = userSnap.data();
      const role = userData.role;
      const children = userData.children ?? [];

      console.log("🧠 User Role:", role);
      console.log("🧒 Children Linked:", children);

      if (role === 'parent') {
        if (children.length === 1) {
          console.log("✅ Logging in as parent of:", children[0]);
          onLogin(role, children[0]); // Pass studentId
        } else {
          alert("This parent has no child or multiple children. Only one is supported currently.");
        }
      } else {
        // For tutors and admins — just pass role
        console.log("✅ Logging in as:", role);
        onLogin(role);
      }

    } catch (err) {
      console.error("Login error:", err.message); // 👈 This helps you see the real error
      setError("Login failed. Please check your credentials.");
    }
    
  };

  return (
    <>
      <Header />
      <div className="login-container" style={{ maxWidth: 400, margin: '40px auto', padding: 20, background: 'white', borderRadius: 8, boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Login to TutorCoach</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 10 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 10 }}
          />
          <button type="submit" style={{ width: '100%', padding: 10, backgroundColor: '#2C3E50', color: '#fff', border: 'none', borderRadius: 4 }}>Login</button>
        </form>

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

        <p style={{ textAlign: 'center', marginTop: 15 }}>
          Don’t have an account?{' '}
          <button
            onClick={switchToSignup}
            style={{
              background: 'none',
              border: 'none',
              color: '#2C3E50',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Sign up
          </button>
        </p>
      </div>
    </>
  );
}


export default Login;



