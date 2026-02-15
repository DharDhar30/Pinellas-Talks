import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { fetchAllResults } from "../services/surveyService";
import "./Dashboard.css";

function Dashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        loadData();
      }
    });

    const loadData = async () => {
      try {
        const data = await fetchAllResults();
        setResults(data);
      } catch (error) {
        alert("Access Denied.");
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const counties = useMemo(() => {
    const unique = [...new Set(results.map(r => r.county))];
    return ["All", ...unique];
  }, [results]);

  const filteredResults = useMemo(() => {
    const filtered =
      selectedCounty === "All"
        ? results
        : results.filter(r => r.county === selectedCounty);

    return filtered.sort(
      (a, b) => b.submittedAt?.toDate() - a.submittedAt?.toDate()
    );
  }, [results, selectedCounty]);

  const sortedIssues = useMemo(() => {
    if (!filteredResults.length) return [];

    return Object.keys(filteredResults[0].responses).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""));
      const numB = parseInt(b.replace(/\D/g, ""));
      return numA - numB;
    });
  }, [filteredResults]);

  // Calculate issue averages
  const issueAverages = useMemo(() => {
    const totals = {};
    const counts = {};

    filteredResults.forEach(entry => {
      Object.entries(entry.responses || {}).forEach(([id, score]) => {
        totals[id] = (totals[id] || 0) + score;
        counts[id] = (counts[id] || 0) + 1;
      });
    });

    const avg = {};
    Object.keys(totals).forEach(id => {
      avg[id] = totals[id] / counts[id];
    });

    return avg;
  }, [filteredResults]);

  const overallAverage = useMemo(() => {
    let total = 0;
    let count = 0;

    Object.values(issueAverages).forEach(score => {
      total += score;
      count++;
    });

    return count ? (total / count).toFixed(2) : "0";
  }, [issueAverages]);

  const sortedByScore = Object.entries(issueAverages).sort(
    (a, b) => b[1] - a[1]
  );

  const topIssues = sortedByScore.slice(0, 3);
  const lowestIssues = sortedByScore.slice(-3).reverse();

  if (loading) return <div className="loading">Verifying Admin Access...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Survey Administration Dashboard</h1>
          <p className="subtext">
            Pinellas County Survey Data Overview
          </p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      {/* SUMMARY CARDS */}
      <section className="stats-grid">
        <div className="card">
          <h3>Total Submissions</h3>
          <p className="big-number">{filteredResults.length}</p>
        </div>

        <div className="card">
          <h3>Overall Average Score</h3>
          <p className="big-number">{overallAverage}</p>
        </div>

        <div className="card">
          <h3>Filter by County</h3>
          <select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
          >
            {counties.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="card">
          <h3>Administrator</h3>
          <p>{user?.email}</p>
        </div>
      </section>

      {/* INSIGHTS */}
      <section className="insights-grid">
        <div className="card">
          <h3>Top 3 Highest Rated Issues</h3>
          {topIssues.map(([id, score]) => (
            <p key={id}>
              {id.replace(/\D/g, "")} —{" "}
              <strong>{score.toFixed(2)}</strong>
            </p>
          ))}
        </div>

        <div className="card">
          <h3>Top 3 Lowest Rated Issues</h3>
          {lowestIssues.map(([id, score]) => (
            <p key={id}>
              {id.replace(/\D/g, "")} —{" "}
              <strong>{score.toFixed(2)}</strong>
            </p>
          ))}
        </div>
      </section>

      {/* TABLE */}
      <section className="table-section">
        <h2>Submission History</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>County</th>
                {sortedIssues.map(issue => (
                  <th key={issue}>
                    {issue.replace(/\D/g, "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResults.map(entry => (
                <tr key={entry.id}>
                  <td>
                    {entry.submittedAt?.toDate().toLocaleDateString()}
                  </td>
                  <td>{entry.county}</td>
                  {sortedIssues.map(issue => {
                    const score = entry.responses[issue];
                    return (
                      <td
                        key={issue}
                        className={
                          score >= 7
                            ? "score-high"
                            : score <= 3
                            ? "score-low"
                            : ""
                        }
                      >
                        {score}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
