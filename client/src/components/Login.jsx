import { useContext } from "react";
import bcrypt from "bcryptjs";
import { LoginContext } from "../context/LoginProvider";

const HOST = import.meta.env.VITE_HOST;

export default function Login() {
  const { username, setUsername, password, setPassword } =
    useContext(LoginContext);

  const handleLogin = async (event) => {
    event.preventDefault();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const response = await fetch(`${HOST}/login?action=login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password: hashedPassword }),
    });
    const responseData = await response.json();
    console.log(`From the server (login): `, responseData);
    if (response.ok) {
      console.log("Login successful", responseData);
      // handle login success
    } else {
      console.log("Login failed", responseData.error);
      // handle login fail
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
