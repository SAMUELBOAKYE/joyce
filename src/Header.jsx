import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "./cartContext";
import DarkModeToggle from "./DarkModeToggle";
import myJoy from "./assets/JOY.jpg";
import "./Header.css";

const Header = () => {
  const { cartItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header-container">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-wrapper">
            <img src={myJoy} alt="App Logo" className="logo" />
            <div className="logo-text-container">
              <h2 className="logo-text neumorphic-logo animate-logo">
                <span> AFIA </span>
              </h2>
              <span className="delivery-area">📍 Only in Koforidua</span>
            </div>
          </div>
        </div>

        <div className="nav-and-controls">
          {/* Hamburger menu button - visible only on mobile */}
          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Navigation links - visible always on desktop, conditionally on mobile */}
          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            <Link to="/" className="nav-item" onClick={closeMenu}>
              🏠 Home
            </Link>
            <Link to="/shop" className="nav-item" onClick={closeMenu}>
              🛍️ Shop
            </Link>
            <Link to="/cart" className="nav-item" onClick={closeMenu}>
              🛒 Cart ({cartItems.length})
            </Link>
            <Link to="/location" className="nav-item" onClick={closeMenu}>
              📍 Location
            </Link>
            <a
              href="https://wa.me/233549202689"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-item"
              onClick={closeMenu}
            >
              📞 Help
            </a>
          </nav>

          {/* Dark mode toggle - different placement for mobile/desktop */}
          <div className="desktop-toggle">
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
