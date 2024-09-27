import { useEffect, useState, useContext } from "react";
import { LoginContext } from "../context/LoginProvider";
import "../styles/Profile.css";

const HOST = import.meta.env.VITE_HOST;

export default function Profile() {
  const [displayname, setDisplayname] = useState("");
  const [profile_img, setProfileImg] = useState("");
  const [background_url, setBackgroundUrl] = useState("");
  const [error, setError] = useState("");
  const { currentLogin } = useContext(LoginContext);

  const fetchProfile = async () => {
    const token = sessionStorage.getItem("authToken");
    try {
      const response = await fetch(`${HOST}/profile?action=fetch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setDisplayname(data.profile.displayname);
        setBackgroundUrl(data.profile.background_url);
        setProfileImg(data.profile.profile_img);
        console.log("Profile data:", data.profile);
        // Handle fetched profile data
      } else {
        console.error("Error fetching profile:", data.error);
        // Handle error
      }
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [displayname, background_url, profile_img]);

  return (
    <div>
      {error && <p className="error-message">{error}</p>}
      <div className="profile-container">
        <h2 className="profile-displayname">{`${displayname}`}</h2>
        <p className="profile-username">{`User: ${currentLogin}`}</p>
        <img
          className="profile-image"
          src={profile_img}
          alt={`${currentLogin} profile image`}
        />
        <img
          className="background-image"
          src={background_url}
          alt={`${currentLogin} background image`}
        />
      </div>
    </div>
  );
}
