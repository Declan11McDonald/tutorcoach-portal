import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

function AdminTutorRequests({ onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('requests');

  const [studentName, setStudentName] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [tutorFirstName, setTutorFirstName] = useState('');
  const [tutorLastName, setTutorLastName] = useState('');
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);

  const fetchRequests = async () => {
    const snapshot = await getDocs(collection(db, 'tutorRequests'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRequests(data);
    setLoading(false);
  };

  const fetchStudentsAndTutors = async () => {
    const studentSnap = await getDocs(collection(db, 'students'));
    const tutorSnap = await getDocs(collection(db, 'users'));

    setStudents(studentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setTutors(tutorSnap.docs.filter(doc => doc.data().role === 'tutor').map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchRequests();
    fetchStudentsAndTutors();
  }, []);

  const handleApprove = async (request) => {
    try {
      const password = Math.random().toString(36).slice(-8);
      const userCredential = await createUserWithEmailAndPassword(auth, request.email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        role: 'tutor',
        createdAt: new Date()
      });

      await deleteDoc(doc(db, 'tutorRequests', request.id));
      alert(`Tutor approved. Temporary password: ${password}`);
      fetchRequests();
      fetchStudentsAndTutors();
    } catch (error) {
      console.error('Approval Error:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('This email is already in use. Cannot approve again.');
      } else {
        alert('Failed to approve tutor.');
      }
    }
  };

  const handleReject = async (id) => {
    try {
      await deleteDoc(doc(db, 'tutorRequests', id));
      fetchRequests();
    } catch (error) {
      console.error('Rejection Error:', error);
      alert('Failed to reject tutor request.');
    }
  };

  const handleAddStudent = async () => {
    try {
      await setDoc(doc(db, 'students', studentName.toLowerCase().replace(/ /g, '-')), {
        name: studentName,
        createdAt: new Date()
      });
      alert('Student added!');
      setStudentName('');
      fetchStudentsAndTutors();
    } catch (err) {
      alert('Error adding student');
      console.error(err);
    }
  };

  const handleAddTutor = async () => {
    try {
      const password = Math.random().toString(36).slice(-8);
      const userCredential = await createUserWithEmailAndPassword(auth, tutorEmail, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        firstName: tutorFirstName,
        lastName: tutorLastName,
        email: tutorEmail,
        role: 'tutor',
        createdAt: new Date()
      });

      alert(`Tutor created! Temporary password: ${password}`);
      setTutorEmail('');
      setTutorFirstName('');
      setTutorLastName('');
      fetchStudentsAndTutors();
    } catch (err) {
      alert('Error creating tutor');
      console.error(err);
    }
  };

  const handleDeleteUser = async (uid, role) => {
    try {
      await deleteDoc(doc(db, role === 'tutor' ? 'users' : 'students', uid));
      alert(`${role === 'tutor' ? 'Tutor' : 'Student'} deleted.`);
      fetchStudentsAndTutors();
    } catch (err) {
      console.error('Delete Error:', err);
      alert('Failed to delete user.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>

      <div className="top-controls">
        <button className="logout-button" onClick={onLogout}>Log out</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setView('requests')}>Tutor Requests</button>
        <button onClick={() => setView('add-student')} style={{ marginLeft: '10px' }}>Add Student</button>
        <button onClick={() => setView('add-tutor')} style={{ marginLeft: '10px' }}>Add Tutor</button>
        <button onClick={() => setView('view-users')} style={{ marginLeft: '10px' }}>View Users</button>
      </div>

      {view === 'requests' && (
        <div>
          <h3>Pending Tutor Requests</h3>
          {loading ? (
            <p>Loading...</p>
          ) : requests.length === 0 ? (
            <p>No tutor requests.</p>
          ) : (
            <ul>
              {requests.map((req) => (
                <li key={req.id} style={{ marginBottom: '1rem' }}>
                  <strong>{req.firstName} {req.lastName}</strong> ({req.email})<br />
                  <button onClick={() => handleApprove(req)}>Approve</button>
                  <button onClick={() => handleReject(req.id)} style={{ marginLeft: '1rem' }}>Reject</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {view === 'add-student' && (
        <div>
          <h3>Add a New Student</h3>
          <input
            type="text"
            placeholder="Student Full Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
          <button onClick={handleAddStudent} style={{ marginLeft: '10px' }}>Add Student</button>
        </div>
      )}

      {view === 'add-tutor' && (
        <div>
          <h3>Add a New Tutor</h3>
          <input
            type="text"
            placeholder="First Name"
            value={tutorFirstName}
            onChange={(e) => setTutorFirstName(e.target.value)}
          /><br /><br />
          <input
            type="text"
            placeholder="Last Name"
            value={tutorLastName}
            onChange={(e) => setTutorLastName(e.target.value)}
          /><br /><br />
          <input
            type="email"
            placeholder="Email"
            value={tutorEmail}
            onChange={(e) => setTutorEmail(e.target.value)}
          /><br /><br />
          <button onClick={handleAddTutor}>Create Tutor</button>
        </div>
      )}

      {view === 'view-users' && (
        <div>
          <h3>Students</h3>
          <ul>
            {students.map((s) => (
              <li key={s.id}>{s.name} <button onClick={() => handleDeleteUser(s.id, 'student')}>Delete</button></li>
            ))}
          </ul>

          <h3 style={{ marginTop: '2rem' }}>Tutors</h3>
          <ul>
            {tutors.map((t) => (
              <li key={t.id}>{t.firstName} {t.lastName} ({t.email}) <button onClick={() => handleDeleteUser(t.id, 'tutor')}>Delete</button></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AdminTutorRequests;



