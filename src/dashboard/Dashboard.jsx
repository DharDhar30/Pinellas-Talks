import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { fetchAllResults } from "../services/surveyService";
import * as XLSX from "xlsx";
import "./Dashboard.css";

function Dashboard() {

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
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

  const filteredResults = useMemo(() => {
    return results.sort(
      (a, b) => b.submittedAt?.toDate() - a.submittedAt?.toDate()
    );
  }, [results]);

  const sortedIssues = useMemo(() => {

    if (!filteredResults.length) return [];

    return Object.keys(filteredResults[0].responses).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""));
      const numB = parseInt(b.replace(/\D/g, ""));
      return numA - numB;
    });

  }, [filteredResults]);

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

  const sortedByScore = Object.entries(issueAverages).sort(
    (a, b) => b[1] - a[1]
  );

  const topIssues = sortedByScore.slice(0, 3);
  const lowestIssues = sortedByScore.slice(-3).reverse();

  const getFormattedData = () => {
    return filteredResults.map(entry => {

      const dateString = entry.submittedAt
        ? entry.submittedAt.toDate().toLocaleDateString()
        : "N/A";

      const row = {
        "Submission ID": entry.id,
        "Date": dateString,
        "County": entry.county || "Pinellas",
      };

      if (entry.ageGroup) row["Age Group"] = entry.ageGroup;

      sortedIssues.forEach(issue => {
        const issueNumber = issue.replace(/\D/g, "");
        row[`Issue ${issueNumber}`] = entry.responses[issue] ?? "N/A";
      });

      return row;
    });
  };

  const exportToCSV = () => {
    const data = getFormattedData();
    if (data.length === 0) return alert("No data to export.");

    const headers = Object.keys(data[0]);
    const csvRows = data.map(row =>
      headers.map(header => `"${row[header]}"`).join(",")
    );
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "community_survey_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToXLSX = () => {
    const data = getFormattedData();
    if (data.length === 0) return alert("No data to export.");

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Responses");
    XLSX.writeFile(workbook, `community_survey_data.xlsx`);
  };

  if (loading) return <div className="loading">Verifying Admin Access...</div>;

  return (
    <div className="dashboard-container">

      <header className="dashboard-header">
        <div>
          <h1>Survey Administration Dashboard</h1>
          <p className="subtext">Pinellas County Survey Data Overview</p>
        </div>

        <div className="header-actions">
          <button onClick={exportToCSV} className="action-btn csv-btn">
            Export CSV
          </button>
          <button onClick={exportToXLSX} className="action-btn xlsx-btn">
            Export XLSX
          </button>
          <button onClick={handleLogout} className="action-btn logout-btn">
            Logout
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <div className="card">
          <h3>Total Submissions</h3>
          <p className="big-number">{filteredResults.length}</p>
        </div>

        <div className="card">
          <h3>Administrator</h3>
          <p>{user?.email}</p>
        </div>
      </section>

      <section className="insights-grid">
        <div className="card">
          <h3>Top 3 Highest Rated Issues</h3>
          {topIssues.map(([id, score]) => (
            <p key={id}>
              {id.replace(/\D/g, "")} — <strong>{score.toFixed(2)}</strong>
            </p>
          ))}
        </div>

        <div className="card">
          <h3>Top 3 Lowest Rated Issues</h3>
          {lowestIssues.map(([id, score]) => (
            <p key={id}>
              {id.replace(/\D/g, "")} — <strong>{score.toFixed(2)}</strong>
            </p>
          ))}
        </div>
      </section>

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
                    <div className="issue-average">
                      Avg: {issueAverages[issue] ? issueAverages[issue].toFixed(2) : "N/A"}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredResults.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.submittedAt?.toDate().toLocaleDateString()}</td>
                  <td>{entry.county}</td>
                  {sortedIssues.map(issue => {
                    const score = entry.responses[issue];
                    return (
                      <td
                        key={issue}
                        className={
                          score >= 7 ? "score-high" :
                          score <= 3 ? "score-low" : ""
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

      <section className="card" style={{ marginTop: "40px" }}>
        <h2>Survey Question Key</h2>
        <ol className="question-list">
          <li>Increase funding for public transportation</li>
          <li>Tax incentives for local businesses</li>
          <li>Invest in renewable energy</li>
          <li>Increase funding for public schools</li>
          <li>Raise Florida minimum wage</li>
          <li>Increase funding for law enforcement programs</li>
          <li>Prioritize affordable housing development</li>
          <li>Strengthen environmental protections</li>
          <li>Improve rural healthcare access</li>
          <li>Support small business owners</li>
          <li>Property tax restructuring</li>
          <li>Expand mental health services</li>
          <li>Prioritize road maintenance</li>
          <li>Increase government transparency</li>
          <li>Improve disaster preparedness</li>
        </ol>
      </section>
    </div>
  );
}

export default Dashboard;