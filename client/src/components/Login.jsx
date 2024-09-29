import { useState, useContext } from "react";
import { LoginContext } from "../context/LoginProvider";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const HOST = import.meta.env.VITE_HOST;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setCurrentLogin } = useContext(LoginContext);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`${HOST}/api/login?action=login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      //const { token } = await response.json();
      const responseData = await response.json();
      console.log(`From the server (login): `, responseData);
      if (response.ok) {
        // handle login success
        setUsername("");
        setPassword("");
        sessionStorage.setItem("authToken", responseData.token);
        setCurrentLogin(responseData.token);
        console.log("Login successful", responseData.message);
        // redirect to profile page
        navigate("/profile");
      } else {
        // handle login fail
        console.log("Login failed", responseData.error);
        setError(`Login failed: ${responseData.error}`);
      }
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form className="login-form" aria-live="polite" onSubmit={handleLogin}>
        <input
          type="username"
          name="username"
          autoComplete="username"
          value={username}
          className="login-input-field username-field"
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Enter your username"
          aria-label="enter your username"
        />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          className="login-input-field password-field"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          aria-label="enter your password"
        />
        <button
          type="submit"
          name="login"
          className="submit-button"
          aria-label="login to account"
        >
          Login
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
