import { useState, useContext } from "react";
import { LoginContext } from "../context/LoginProvider";
import { useNavigate } from "react-router-dom";
import "../styles/EditProfile.css";

const HOST = import.meta.env.VITE_HOST;

export default function EditProfile() {
  const [displayname, setDisplayname] = useState("");
  const [profile_img, setProfileImg] = useState("");
  const [background_url, setBackgroundUrl] = useState("");
  const [error, setError] = useState("");
  const { currentLogin } = useContext(LoginContext);
  const navigate = useNavigate();

  const isValidUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch (error) {
      console.log(error);
      return false; // Invalid URL
    }
  };

  const updateProfile = async (event) => {
    event.preventDefault();
    const token = sessionStorage.getItem("authToken");
    try {
      const response = await fetch(`${HOST}/api/profile?action=update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          background_url,
          profile_img,
          displayname,
        }),
      });
      const responseData = await response.json();
      if (response.ok) {
        // Handle successful profile update
        console.log("Profile updated successfully", responseData.message);
        // redirect to profile page
        navigate("/profile");
      } else {
        // Handle update failure
        console.error("Error updating profile:", responseData.error);
        setError(`Error updating profile: ${responseData.error.message}`);
      }
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };
  return (
    <div className="edit-container">
      <h2 className="edit-title">{`Edit ${currentLogin}'s Profile`}</h2>
      <form className="edit-form" aria-live="polite" onSubmit={updateProfile}>
        <input
          type="username"
          name="username"
          autoComplete="name"
          value={displayname}
          className="edit-input-field displayname-field"
          onChange={(event) => setDisplayname(event.target.value)}
          placeholder="Enter a display name"
          aria-label="enter your display name"
        />
        <input
          type="URL"
          name="URL"
          autoComplete="url"
          value={profile_img}
          className="edit-input-field"
          onChange={(event) => {
            setProfileImg(event.target.value);
            if (!isValidUrl(event.target.value)) {
              setError(
                "Please enter a valid URL starting with http:// or https://"
              );
            } else {
              setError("");
            }
          }}
          placeholder="Profile Image URL"
          aria-label="enter your profile image URL"
        />
        <input
          type="URL"
          name="URL"
          autoComplete="url"
          value={background_url}
          className="edit-input-field"
          onChange={(event) => {
            setBackgroundUrl(event.target.value);
            if (!isValidUrl(event.target.value)) {
              setError(
                "Please enter a valid URL starting with http:// or https://"
              );
            } else {
              setError("");
            }
          }}
          placeholder="Background Image URL"
          aria-label="enter your background image URL"
        />
        <button
          type="submit"
          name="save"
          className="submit-button"
          aria-label="save changes"
        >
          Save
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
