import { useState } from "react";
import bcrypt from "bcryptjs";

const HOST = import.meta.env.VITE_HOST;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    const data = { password };
    const storedHashedPassword = await fetch(HOST + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }); /* Fetch from backend */
    const isMatch = await bcrypt.compare(password, storedHashedPassword);
    if (isMatch) {
      // Login successful
    } else {
      // Incorrect password
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
