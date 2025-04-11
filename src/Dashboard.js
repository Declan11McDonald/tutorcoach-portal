import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

function Dashboard({ onLogout, studentId }) {
  const [sessions, setSessions] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [lessonPlanFolderURL, setLessonPlanFolderURL] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentRef = doc(db, 'students', studentId);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
          const studentData = studentSnap.data();
          setStudentName(studentData.name);
          setLessonPlanFolderURL(studentData.lessonPlanFolderURL || '');

          const sessionsRef = collection(studentRef, 'sessions');
          const sessionSnapshot = await getDocs(sessionsRef);

          const sessionList = sessionSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));

          setSessions(sessionList);
        } else {
          console.warn("No student found for this ID.");
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const filteredSessions = sessions
    .filter((session) => {
      const sessionDate = new Date(session.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const subjectMatch = selectedSubject
        ? Array.isArray(session.subjects) && session.subjects.includes(selectedSubject)
        : true;

      return (
        (!start || sessionDate >= start) &&
        (!end || sessionDate <= end) &&
        subjectMatch
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
    .reverse();

  const chartData = filteredSessions.map(session => ({
    dateLabel: new Date(session.date).toLocaleDateString(),
    sightWords1: session.SightWords1 ?? null,
    spelling: session.Spelling ?? null,
    readingComprehension: session.ReadingComprehension ?? null,
    sightWords2: session.SightWords2 ?? null,
    mentalMath: session.MentalMath ?? null,
    multiplication: session.Multiplication ?? null,
    division: session.Division ?? null,
    orderOfOperations: session.OrderOfOperations ?? null
  }));

  const hasDataFor = {
    SightWords1: filteredSessions.some(s => s.SightWords1 != null),
    Spelling: filteredSessions.some(s => s.Spelling != null),
    ReadingComprehension: filteredSessions.some(s => s.ReadingComprehension != null),
    SightWords2: filteredSessions.some(s => s.SightWords2 != null),
    MentalMath: filteredSessions.some(s => s.MentalMath != null),
    Multiplication: filteredSessions.some(s => s.Multiplication != null),
    Division: filteredSessions.some(s => s.Division != null),
    OrderOfOperations: filteredSessions.some(s => s.OrderOfOperations != null),
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  const renderBarChart = (dataKey, label, color) => {
    const hasData = chartData.some(entry => entry[dataKey] !== null && entry[dataKey] !== undefined);
    if (!hasData) return null;

    return (
      <div className="chart-box">
        <h4>{label}</h4>
        <ResponsiveContainer width="95%" height={200}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            barSize={15}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateLabel" />
            <YAxis domain={[0, (dataMax) => Math.ceil(dataMax * 1.25)]} />
            <Tooltip />
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="parent-dashboard">
      <h2>Welcome to {studentName}’s Dashboard</h2>

      <div className="top-controls">
        {lessonPlanFolderURL && (
          <a
            href={lessonPlanFolderURL}
            target="_blank"
            rel="noopener noreferrer"
            className="lesson-plan-button"
          >
            📂 View All Lesson Plans
          </a>
        )}
        <button className="logout-button" onClick={handleLogout}>
          Log out
        </button>
      </div>

      <div className="filters">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label>
          Subject:
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">All</option>
            <option value="Reading">Reading</option>
            <option value="Math">Math</option>
            <option value="Math and Reading">Math and Reading</option>
          </select>
        </label>
      </div>

      <h3>Last 10 Sessions:</h3>
      <table className="sessions-table">
        <thead>
          <tr>
            <th>Date</th>
            {hasDataFor.SightWords1 && <th>Sight Words #1</th>}
            {hasDataFor.Spelling && <th>Spelling</th>}
            {hasDataFor.ReadingComprehension && <th>Reading Comp</th>}
            {hasDataFor.SightWords2 && <th>Sight Words #2</th>}
            {hasDataFor.MentalMath && <th>Mental Math</th>}
            {hasDataFor.Multiplication && <th>Multiplication</th>}
            {hasDataFor.Division && <th>Division</th>}
            {hasDataFor.OrderOfOperations && <th>Order of Ops</th>}
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {filteredSessions.map((session) => (
            <tr key={session.id}>
              <td>{session.date}</td>
              {hasDataFor.SightWords1 && <td>{session.SightWords1 ?? '-'}</td>}
              {hasDataFor.Spelling && <td>{session.Spelling ?? '-'}</td>}
              {hasDataFor.ReadingComprehension && <td>{session.ReadingComprehension ?? '-'}</td>}
              {hasDataFor.SightWords2 && <td>{session.SightWords2 ?? '-'}</td>}
              {hasDataFor.MentalMath && <td>{session.MentalMath ?? '-'}</td>}
              {hasDataFor.Multiplication && <td>{session.Multiplication ?? '-'}</td>}
              {hasDataFor.Division && <td>{session.Division ?? '-'}</td>}
              {hasDataFor.OrderOfOperations && <td>{session.OrderOfOperations ?? '-'}</td>}
              <td>{session.notes ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="charts-grid">
        {renderBarChart('sightWords1', 'Sight Words #1', '#8884d8')}
        {renderBarChart('spelling', 'Spelling', '#82ca9d')}
        {renderBarChart('readingComprehension', 'Reading Comp', '#ffc658')}
        {renderBarChart('sightWords2', 'Sight Words #2', '#8dd1e1')}
        {renderBarChart('mentalMath', 'Mental Math', '#ff8042')}
        {renderBarChart('multiplication', 'Multiplication', '#a4de6c')}
        {renderBarChart('division', 'Division', '#d0ed57')}
        {renderBarChart('orderOfOperations', 'Order of Ops', '#ffc0cb')}
      </div>
    </div>
  );
}

export default Dashboard;






