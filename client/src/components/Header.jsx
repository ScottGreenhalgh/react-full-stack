import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LoginContext } from "../context/LoginProvider";
import "../styles/Header.css";

export default function Header() {
  const { currentLogin, clearSession } = useContext(LoginContext);
  const navigate = useNavigate();

  const logoutUser = () => {
    clearSession();
    console.log("Successfully logged out");
    navigate("/");
  };

  return (
    <nav>
      <Link className="header-link" to={"/"}>
        Home
      </Link>
      {currentLogin ? (
        <>
          <Link className="header-link" to={"/profile"}>
            Profile
          </Link>
          <Link className="header-link" to={"/editprofile"}>
            Edit Profile
          </Link>
          <p className="header-username">{currentLogin}</p>
          <p className="header-logout" onClick={logoutUser}>
            Logout
          </p>
        </>
      ) : (
        <>
          <Link className="header-link" to={"/register"}>
            Register
          </Link>
          <Link className="header-link" to={"/login"}>
            Login
          </Link>
        </>
      )}
    </nav>
  );
}
