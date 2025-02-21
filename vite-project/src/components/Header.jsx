import React from "react";
import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import { FaHeart, FaShoppingCart, FaUser } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Header = () => {
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
                <FaHeart size={20} />
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/cart"
                className="text-black position-relative"
              >
                <FaShoppingCart size={20} />
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  0
                </Badge>
              </Nav.Link>
            </div>
            <Nav.Link as={NavLink} to="/profile" className="text-black">
              <FaUser size={20} />
            </Nav.Link>
          </div>

          {/* Navigation Links - Center on Desktop, Below on Mobile */}
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
              to="/categories"
              className="text-black"
              activeclassname="active"
            >
              Categories
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

          {/* Cart, Wishlist, and User Profile - Desktop Icons */}
          <div className="d-none d-lg-flex justify-content-end gap-3">
            <Nav.Link
              as={NavLink}
              to="/wishlist"
              className="text-black position-relative"
            >
              <FaHeart size={20} />
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/cart"
              className="text-black position-relative"
            >
              <FaShoppingCart size={20} />
              <Badge
                bg="danger"
                pill
                className="position-absolute top-0 start-100 translate-middle"
              >
                0
              </Badge>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/profile" className="text-black">
              <FaUser size={20} />
            </Nav.Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
