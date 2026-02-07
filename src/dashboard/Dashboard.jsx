import{useState, useEffect} from 'react';
import{ fetchAllResults} from '../services/surveyService';

function Dashboard(){
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadData = async() =>{
        try{
          const data = await fetchAllResults();
          setResults(data);
        }catch(error){
          alert("Error fetching survey results: " + error.message);
        }finally{
          setLoading(false);
        }
      }
      loadData();
    },[]);

    if (loading) return <p>Loading Dashboard Data...</p>;

  return (
    <div className="admin-dashboard">
      <h1>Pinellas County Survey Results</h1>
      <p>Total Submissions: {results.length}</p>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>County</th>
            <th>Responses (Issue ID: Score)</th>
          </tr>
        </thead>
        <tbody>
          {results.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.submittedAt?.toDate().toLocaleDateString()}</td>
              <td>{entry.county}</td>
              <td>
                {/* Displaying responses as a string for quick reading */}
                {Object.entries(entry.responses).map(([id, score]) => (
                  <span key={id} style={{ marginRight: '10px' }}>
                    {id}: <strong>{score}</strong>
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}