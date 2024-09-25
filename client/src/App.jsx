import { LoginProvider } from "./context/LoginProvider";
import "./App.css";
import Register from "./components/Register";
import Login from "./components/Login";

export default function App() {
  return (
    <LoginProvider>
      <Login />
      <Register />
    </LoginProvider>
  );
}
