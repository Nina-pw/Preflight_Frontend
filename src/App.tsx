import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Login from "./login";
import Register from "./register";
import TodoPage from "./todo";
import axios from "axios";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // <-- เพิ่ม loading state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      setIsLoggedIn(false);
    }

    setLoading(false); // <-- ตรวจ token เสร็จแล้วค่อย render
  }, [location]);

  if (loading) return <p>Loading...</p>; // <-- รอเช็ค token เสร็จก่อน

  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/todo" /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={
          <Login
            onLoginSuccess={() => {
              setIsLoggedIn(true);
              navigate("/todo");
            }}
          />
        }
      />
      <Route path="/register" element={<Register />} />
      <Route
        path="/todo"
        element={isLoggedIn ? <TodoPage /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
