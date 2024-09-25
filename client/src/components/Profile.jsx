const HOST = import.meta.env.VITE_HOST;

export default function Profile() {
  const fetchProfile = async (username) => {
    const response = await fetch(`${HOST}/profile?action=fetch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
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
