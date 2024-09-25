const HOST = import.meta.env.VITE_HOST;

export default function EditProfile() {
  const updateProfile = async (
    username,
    background_url,
    profile_img,
    displayname
  ) => {
    const token = sessionStorage.getItem("authToken");
    const response = await fetch(`${HOST}/profile?action=update`, {
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
    const data = await response.json();
    if (response.ok) {
      console.log("Profile updated successfully", data);
      // Handle successful profile update
    } else {
      console.error("Error updating profile:", data.error);
      // Handle update failure
    }
  };
  return (
    <div>
      <p onClick={updateProfile}></p>
    </div>
  );
}
