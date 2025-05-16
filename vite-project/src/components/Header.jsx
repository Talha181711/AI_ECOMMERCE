import React from "react";
import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FiHeart, FiShoppingCart, FiUser } from "react-icons/fi"; // Sleek modern icons
import "bootstrap/dist/css/bootstrap.min.css";

const Header = () => {
  const { cartCount } = useCart(); // Get live cart count from context

  return (
    <Navbar
      expand="lg"
      className="bg-white"
      variant="light"
      sticky="top"
      style={{ borderBottom: "1px solid #ddd" }}
    >
      <Container>
        {/* Logo */}
        <Navbar.Brand as={NavLink} to="/" className="fw-bold text-black">
          MyStore
        </Navbar.Brand>

        {/* Mobile Toggle Button */}
        <Navbar.Toggle
          aria-controls="navbar-nav"
          className="border-0 text-black"
        />

        <Navbar.Collapse id="navbar-nav">
          {/* Wishlist, Cart, and User Profile - Top on Mobile */}
          <div className="d-lg-none d-flex justify-content-between py-2">
            <div className="d-flex gap-3">
              <Nav.Link
                as={NavLink}
                to="/wishlist"
                className="text-black position-relative"
              >
                <FiHeart size={22} />
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/cart"
                className="text-black position-relative"
              >
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Nav.Link>
            </div>
            <Nav.Link as={NavLink} to="/profile" className="text-black">
              <FiUser size={22} />
            </Nav.Link>
          </div>

          {/* Navigation Links */}
          <Nav className="mx-auto text-center flex-column flex-lg-row mt-2 mt-lg-0">
            <Nav.Link
              as={NavLink}
              to="/"
              className="text-black"
              activeclassname="active"
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/shop"
              className="text-black"
              activeclassname="active"
            >
              Shop
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/about"
              className="text-black"
              activeclassname="active"
            >
              About
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/contact"
              className="text-black"
              activeclassname="active"
            >
              Contact
            </Nav.Link>
          </Nav>

          {/* Desktop Icons */}
          <div className="d-none d-lg-flex justify-content-end gap-3">
            <Nav.Link
              as={NavLink}
              to="/wishlist"
              className="text-black position-relative"
            >
              <FiHeart size={22} />
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/cart"
              className="text-black position-relative"
            >
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  {cartCount}
                </Badge>
              )}
            </Nav.Link>
            <Nav.Link as={NavLink} to="/profile" className="text-black">
              <FiUser size={22} />
            </Nav.Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
