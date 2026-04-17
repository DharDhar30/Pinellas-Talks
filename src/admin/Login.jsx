import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Login error:", err.code);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Admin Login</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <input 
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Enter Dashboard</button>

        {/* Return to Survey Button */}
        <Link to="/">
          <button
            type="button"
            style={{
              marginTop: "12px",
              backgroundColor: "#000000",
              color: "#FFFFFF",
              border: "none",
              padding: "10px",
              width: "100%",
              cursor: "pointer",
              borderRadius: "4px"
            }}
          >
            Return to Survey
          </button>
        </Link>

      </form>
    </div>
  );
}

export default Login;