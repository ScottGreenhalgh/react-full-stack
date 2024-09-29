import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

const HOST = import.meta.env.VITE_HOST;

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    // check password in both fields matches
    if (!(password === password2)) {
      setError("Registration failed: Passwords do not match");
      return; // some form of return logic here?
    }
    setError("");
    // send password to backend for storage
    try {
      const response = await fetch(`${HOST}/api/login?action=register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      // recieve response
      const responseData = await response.json();
      console.log(`From the server (register): `, responseData);
      if (response.ok) {
        // handle registration success
        setUsername("");
        setPassword("");
        setPassword2("");
        console.log("Registration successful: ", responseData);
        // redirect to login page
        navigate("/login");
      } else {
        console.error("Registration failed", responseData.error.message);
        setError(`Registration failed: ${responseData.error.message}`);
        // handle registration fail
      }
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };

  return (
    <div className="reg-container">
      <h2 className="reg-title">Register</h2>
      <form className="reg-form" aria-live="polite" onSubmit={handleRegister}>
        <input
          type="username"
          name="username"
          autoComplete="username"
          value={username}
          className="reg-input-field username-field"
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Enter a username"
          aria-label="enter a registration username"
        />
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          value={password}
          className="reg-input-field password-field"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter a password"
          aria-label="Enter your new password"
        />
        <input
          type="password"
          name="password"
          autoComplete="login"
          value={password2}
          className="reg-input-field password-field"
          onChange={(event) => setPassword2(event.target.value)}
          placeholder="Retype password"
          aria-label="Confirm your new password"
        />
        <button
          type="submit"
          name="register"
          className="submit-button"
          aria-label="register account"
        >
          Register
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
