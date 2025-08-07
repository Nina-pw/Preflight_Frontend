import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./login.css"; // <-- เพิ่มไฟล์ CSS

type LoginProps = {
  onLoginSuccess: () => void;
};

const Login = ({ onLoginSuccess }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const token = response.data.token;
      localStorage.setItem("token", token);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setError("");
      onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h1>Hello!</h1>
        <p className="subtitle">Let’s get started your plans</p>

        <input
          type="email"
          placeholder="Email"
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

        {/* <div className="recovery">
          <a href="#">Recovery Password</a>
        </div> */}

        <button type="submit" className="sign-in-btn">
          Sign In
        </button>

        {error && <p className="error">{error}</p>}

        <p className="register-link">
          Don’t have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
