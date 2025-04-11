import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './TutorDashboard.css';

function TutorDashboard({ onLogout }) {
  const [date, setDate] = useState('');
  const [subject, setSubject] = useState('Reading');
  const [formData, setFormData] = useState({});
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchTutorStudents = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const userData = userSnap.data();
        const studentIds = userData.students || [];

        const studentData = await Promise.all(
          studentIds.map(async (id) => {
            const studentRef = doc(db, 'students', id);
            const studentSnap = await getDoc(studentRef);
            return studentSnap.exists() ? { id, name: studentSnap.data().name } : null;
          })
        );

        const validStudents = studentData.filter(Boolean);
        setStudents(validStudents);
        if (validStudents.length > 0) setSelectedStudent(validStudents[0].id);
      } catch (err) {
        console.error('Error fetching tutor student list:', err);
      }
    };

    fetchTutorStudents();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!date || !subject || !selectedStudent) return alert('Please complete all required fields.');
    const sessionRef = doc(db, 'students', selectedStudent, 'sessions', date);
    await setDoc(sessionRef, {
      date,
      subjects: subject,
      ...formData,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  const subjectFields = {
    Reading: ['SightWords1', 'Spelling', 'ReadingComprehension', 'SightWords2'],
    Math: ['MentalMath', 'Multiplication', 'Division', 'OrderOfOperations'],
    'Math and Reading': [
      'SightWords1',
      'ReadingComprehension',
      'SightWords2',
      'MentalMath',
      'Multiplication',
      'Division',
      'OrderOfOperations',
    ],
  };

  return (
    <div className="tutor-dashboard">
      {showToast && (
        <div className="toast-message">
          ✅ Session saved successfully!
        </div>
      )}
      <div className="top-bar">
        <div className="session-info">
          <h2>Tutor Session Entry</h2>
          <label>
            Date:
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Subject:
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="Reading">Reading</option>
              <option value="Math">Math</option>
              <option value="Math and Reading">Math and Reading</option>
            </select>
          </label>
          <label>
            Student:
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="top-buttons">
          <button onClick={handleSubmit}>Submit Session</button>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <div className="form-fields">
        {subjectFields[subject].map((field) => (
          <label key={field}>
            {field.replace(/([A-Z])/g, ' $1').trim()}:
            <input
              type="text"
              name={field}
              value={formData[field] || ''}
              onChange={handleChange}
            />
          </label>
        ))}

        <label>
          Notes:
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
          ></textarea>
        </label>
      </div>
    </div>
  );
}

export default TutorDashboard;










