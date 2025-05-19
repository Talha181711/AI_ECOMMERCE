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
import ViewProducts from "./Admin/ViewProducts";
import AddProduct from "./Admin/AddProduct";
import EditProduct from "./Admin/EditProduct";
import Shop from "./pages/shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import EmployeeLogin from "./Employee/EmployeeLogin";
import EmployeeDashboard from "./Employee/EmployeeDashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
        <Route path="/admin/view-products" element={<ViewProducts />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        {/* Employee Routes */}
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
