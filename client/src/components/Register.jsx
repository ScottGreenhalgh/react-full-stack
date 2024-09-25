import { useContext, useState } from "react";
import bcrypt from "bcryptjs";
import { LoginContext } from "../context/LoginProvider";

const HOST = import.meta.env.VITE_HOST;

export default function Register() {
  const { username, setUsername, password, setPassword } =
    useContext(LoginContext);
  const [password2, setPassword2] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();
    // check password in both fields matches
    if (!(password === password2)) {
      setUsername("");
      return;
    }
    // hash password so plain text isn't stored in the db
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Send hashedPassword to backend for storage
    const response = await fetch(HOST + "/login", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, hashedPassword }), // send hashedPassword
    });
    // recieve response
    const responseData = await response.json();
    console.log(`From the server (login): `, responseData);
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
