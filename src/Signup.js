import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, setDoc, doc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import Header from './Header';

function Signup({ switchToLogin }) {
  const [role, setRole] = useState('parent'); // parent or tutor
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitted(false);

    try {
      if (role === 'tutor') {
        // Store request in Firestore
        await addDoc(collection(db, 'tutorRequests'), {
          firstName,
          lastName,
          email,
          createdAt: Timestamp.now()
        });
        setSubmitted(true);
      } else {
        // Parent signup: create Firebase Auth user + Firestore doc
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          email,
          role: 'parent',
          createdAt: Timestamp.now()
        });

        alert('Parent account created! Please log in.');
        switchToLogin();
      }
    } catch (err) {
      console.error('Signup Error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <Header />
      <div className="signup-container" style={{ maxWidth: 400, margin: '40px auto', padding: 20, background: 'white', borderRadius: 8, boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center' }}>Create an Account</h2>

        {submitted ? (
          <p style={{ color: 'green', textAlign: 'center' }}>
            Tutor request submitted! We’ll contact you if approved.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>Role:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', marginBottom: 10, padding: 10 }}
            >
              <option value="parent">Parent</option>
              <option value="tutor">Tutor</option>
            </select>

            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 10, padding: 10 }}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 10, padding: 10 }}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', marginBottom: 10, padding: 10 }}
            />
            {role === 'parent' && (
              <input
                type="password"
                placeholder="Password (6+ characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', marginBottom: 10, padding: 10 }}
              />
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: 10,
                backgroundColor: '#2C3E50',
                color: '#fff',
                border: 'none',
                borderRadius: 4
              }}
            >
              {role === 'parent' ? 'Create Parent Account' : 'Submit Tutor Request'}
            </button>
          </form>
        )}

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

        <p style={{ textAlign: 'center', marginTop: 15 }}>
          Already have an account?{' '}
          <button
            onClick={switchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#2C3E50',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Log in
          </button>
        </p>
      </div>
    </>
  );
}

export default Signup;



