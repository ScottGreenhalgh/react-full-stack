import { createContext, useEffect, useState } from "react";

export const LoginContext = createContext();

const HOST = import.meta.env.VITE_HOST;

export function LoginProvider({ children }) {
  const [currentLogin, setCurrentLogin] = useState("");

  const fetchSession = async () => {
    const token = sessionStorage.getItem("authToken");
    //console.log(token);
    if (token) {
      try {
        const response = await fetch(`${HOST}/api/session`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setCurrentLogin(data.username);
        } else {
          console.error("Invalid or expired token ", data.error);
          clearSession();
        }
      } catch (error) {
        console.error("Error fetching session: ", error);
        clearSession();
      }
    }
  };

  const clearSession = () => {
    sessionStorage.removeItem("authToken");
    setCurrentLogin("");
  };

  useEffect(() => {
    fetchSession();
  }, [currentLogin]);

  return (
    <LoginContext.Provider
      value={{ currentLogin, setCurrentLogin, clearSession }}
    >
      {children}
    </LoginContext.Provider>
  );
}
