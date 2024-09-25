import { useState } from "react";

const HOST = import.meta.env.VITE_HOST;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    const response = await fetch(`${HOST}/login?action=login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    //const { token } = await response.json();
    const responseData = await response.json();
    console.log(`From the server (login): `, responseData);
    sessionStorage.setItem("authToken", responseData.token);
    if (response.ok) {
      // handle login success
      setUsername("");
      setPassword("");
      console.log("Login successful", responseData.message);
    } else {
      // handle login fail
      console.log("Login failed", responseData.error);
      setError(`Login failed: ${responseData.error}`);
    }
  };

  return (
    <form className="login-form" aria-live="polite" onSubmit={handleLogin}>
      <input
        type="username"
        value={username}
        className="username-field"
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Enter a username"
        aria-label="enter your username"
      />
      <input
        type="password"
        value={password}
        className="password-field"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter your password"
        aria-label="enter your password"
      />
      {error && <p className="error-message">{error}</p>}
      <button
        type="submit"
        className="submit-button"
        name="login"
        aria-label="login to account"
      >
        Login
      </button>
    </form>
  );
}
