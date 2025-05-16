import React, { useEffect, useState } from "react";
import axios from "axios";
import UserProfile from "./UserProfile";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_HOST_URL}/get_user.php`,
          {
            withCredentials: true,
          }
        );
        const data = response.data;
        if (data.status === "success") {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return user ? (
    user.role === "admin" ? (
      <AdminProfile user={user} />
    ) : (
      <UserProfile user={user} />
    )
  ) : (
    <div>
      <h2>Please log in to view your profile or sign up</h2>
      <button onClick={() => navigate("/login")}>Login</button>
      <button onClick={() => navigate("/signup")}>Sign Up</button>
    </div>
  );
};

export default ProfilePage;
