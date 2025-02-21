import React from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/profile";
import HomePage from "./pages/HomePage"; // Correct import for HomePage
import UserProfile from "./pages/UserProfile";
import AdminLogin from "./Admin/AdminLogin";
import AdminDashboard from "./Admin/AdminDashboard";
import ViewProductsPage from "./Admin/ViewProductsPage";
import AddProduct from "./Admin/AddProduct";
function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/Userprofile" element={<UserProfile />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/view-products" element={<ViewProductsPage />} />
      </Routes>
    </div>
  );
}

export default App;
