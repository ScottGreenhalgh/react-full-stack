import "./App.css";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import NotFoundPage from "./components/NotFoundPage";
import { LoginProvider } from "./context/LoginProvider";
import ProtectedRoute from "./context/ProtectedRoute";

export default function App() {
  return (
    <LoginProvider>
      <Header />
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editprofile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </LoginProvider>
  );
}
