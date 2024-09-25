const HOST = import.meta.env.VITE_HOST;

export default function Profile() {
  const fetchProfile = async () => {
    const token = sessionStorage.getItem("authToken");
    const response = await fetch(`${HOST}/profile?action=fetch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Profile data:", data.profile);
      // Handle fetched profile data
    } else {
      console.error("Error fetching profile:", data.error);
      // Handle error
    }
  };
  return (
    <div>
      <p onClick={fetchProfile}></p>
    </div>
  );
}
