import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`; // <-- เพิ่มตรงนี้
    setError("");
    onLoginSuccess();
  } catch (err: any) {
    setError(err.response?.data?.error || "Login failed");
  }
};

  return (
    <main className="container" style={{ maxWidth: 400, marginTop: "4rem" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Email
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Login</button>
      </form>

      <p>
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
};

export default Login;
