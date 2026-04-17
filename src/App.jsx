import React, { useState, useEffect } from 'react';
import './App.css';
import { db, auth } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { submitSurvey } from './services/surveyService';
import { Routes, Route, Navigate } from 'react-router-dom'; //Routers for page navigation

// Component Imports
import IssueList from './components/IssueList';
import Login from './admin/Login';
import Dashboard from './dashboard/Dashboard';
import colors from './color';

const questions = [
  { id: "issue_id_01", text: "The federal government should do something about the affordability of groceries." },
  { id: "issue_id_02", text: "The federal government should do something to prevent investors from driving up the prices of single family homes." },
  { id: "issue_id_03", text: "The federal government should increase controls over the quality of food." },
  { id: "issue_id_04", text: "Your representative in Congress should submit laws to benefit your community and not just vote on laws that other representatives propose." },
  { id: "issue_id_05", text: "The federal government should change the tax code so that billion dollar companies pay the same tax percentage as small family owned companies." },
  { id: "issue_id_06", text: "Taxes on senior citizens who earn less than $100,000 per year should be eliminated as soon as an individual turns 65 years old, and use the taxes from billion dollar companies to fund the tax break for seniors." },
  { id: "issue_id_07", text: "The federal government should increase funding for public transportation." },
  { id: "issue_id_08", text: "The federal government should provide tax incentives for businesses with less than 50 employees." },
  { id: "issue_id_09", text: "The federal government should invest in renewable energy." },
  { id: "issue_id_10", text: "The federal government should increase funding for public schools." },
  { id: "issue_id_11", text: "The federal government should raise Florida's minimum wage." },
  { id: "issue_id_12", text: "The federal government should increase funding for law enforcement programs." },
  { id: "issue_id_13", text: "The federal government should prioritize affordable housing development." },
  { id: "issue_id_14", text: "The federal government should strengthen environmental protections." },
  { id: "issue_id_15", text: "The federal government should improve rural healthcare access." },
  { id: "issue_id_16", text: "The federal government should support small business owners through grants." },
  { id: "issue_id_17", text: "The federal government should implement a flat income tax of 15% for all." },
  { id: "issue_id_18", text: "The federal government should expand mental health services." },
  { id: "issue_id_19", text: "The federal government should prioritize road maintenance." },
  { id: "issue_id_20", text: "The federal government should increase government transparency." },
  { id: "issue_id_21", text: "The federal government should improve disaster preparedness." },
  { id: "issue_id_22", text: "The federal government should protect the beaches of Pinellas County by restricting all companies statewide from polluting into the canals that lead to the gulf waters." }
];

// Strict security to protect the admin dashboard
const ProtectedRoute = ({ children, user, isAuthReady }) => {
  if (!isAuthReady) {
    return <div style={{textAlign: 'center', marginTop: '100px', fontSize: '18px'}}>Securely verifying credentials...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const [answers, setAnswers] = useState(() => {
    let initial = {};
    questions.forEach((q) => {
      initial[q.id] = 5;
    });
    return initial;
  });

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true); 
    });
    return () => unsubscribe();
  }, []);

  function handleSlider(issueId, value) {
    setAnswers(prev => ({
      ...prev,
      [issueId]: Number(value)
    }));
    setTouched(prev => ({
      ...prev,
      [issueId]: true
    }));
  }

  const allTouched = questions.every((q) => touched[q.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const docId = await submitSurvey("Pinellas", answers); 
      console.log('Success! ID:', docId); 
      setSubmitted(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Routes>
      {/* PUBLIC SURVEY ROUTE */}
      <Route path="/" element={
        submitted ? (
          <div className="app">
            <div className="container">
              <div className="thankyou">
                <h1>Thank You!</h1>
                <p>Your responses have been recorded.</p>
                <p>Thank you for participating in the Pinellas County community survey.</p>
                <button onClick={() => {
                  setSubmitted(false);
                  setTouched({});
                  let reset = {};
                  questions.forEach((q) => reset[q.id] = 5);
                  setAnswers(reset);
                }}>
                  Take Again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="app">
            <div className="container">
              <header>
                <h1>Pinellas Talks</h1>
                <span className="badge">Pinellas County, Florida</span>
                <p>Rate your agreement with each statement from 1-10</p>
                <div className="scale-info">
                  <span>1 = Strongly Disagree</span>
                  <span>10 = Strongly Agree</span>
                </div>
              </header>
              
              <form onSubmit={handleSubmit}>
                {questions.map((question, index) => (
                  <div className="question-box" key={question.id}>
                    <p><strong>{index + 1}.</strong> {question.text}</p>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={answers[question.id]}
                      onChange={(e) => handleSlider(question.id, e.target.value)}
                    />
                    <div className="value-bubble">{touched[question.id] ? answers[question.id] : '-'}</div>
                    <div className="tick-marks">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                      <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
                    </div>
                  </div>
                ))}

                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={!allTouched || loading}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </form>

              <footer style={{ marginTop: '50px', textAlign: 'center' }}>
                <button 
                  onClick={() => window.location.href='/Pinellas-Talks/login'} 
                  style={{fontSize: '11px', background: colors.text, border: 'none', cursor: 'pointer' }}
                >
                  Admin Access
                </button>
              </footer>
            </div>
          </div>
        )
      } />

      {/* ADMIN & AUTH ROUTES */}
      <Route path="/admin" element={
        <ProtectedRoute user={user} isAuthReady={isAuthReady}>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/login" element={
        user ? <Navigate to="/admin" replace /> : <Login />
      } />
      <Route path="/auth" element={<Login />} />
    </Routes>
  );
}

export default App;