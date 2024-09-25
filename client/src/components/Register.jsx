import { useState } from "react";

const HOST = import.meta.env.VITE_HOST;

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();
    // check password in both fields matches
    if (!(password === password2)) {
      setError("Passwords do not match");
      return; // some form of return logic here?
    }
    setError("");
    // send password to backend for storage
    const response = await fetch(`${HOST}/login?action=register`, {
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
      console.log("Registration successful", responseData);
    } else {
      console.log("Registration failed", responseData.error);
      setError(`Registration failed: ${responseData.error}`);
      // handle registration fail
    }
  };

  return (
    <form
      className="register-form"
      aria-live="polite"
      onSubmit={handleRegister}
    >
      <input
        type="username"
        value={username}
        className="username-field"
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Enter a username"
        aria-label="enter a registration username"
      />
      <input
        type="password"
        value={password}
        className="password-field"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter a password"
        aria-label="enter an accompanying password"
      />
      <input
        type="password"
        value={password2}
        className="password-field"
        onChange={(event) => setPassword2(event.target.value)}
        placeholder="Retype password"
        aria-label="retype your password"
      />
      {error && <p className="error-message">{error}</p>}
      <button
        type="submit"
        className="submit-button"
        name="register"
        aria-label="register account"
      >
        Register
      </button>
    </form>
  );
}
