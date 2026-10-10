import React from "react";
import { Link } from "react-router-dom";
import {
Droplets,
MapPin,
ArrowUpRight,
Mail,
Phone,
} from "lucide-react";
import "./CustomerFooter.css";

export default function CustomerFooter() {
return (
  <footer className="waterflow-footer">
    {" "}
    <div className="waterflow-footer-container">
      {" "}
      <div className="waterflow-footer-brand">
        {" "}
        <Link to="/products" className="waterflow-footer-logo">
          {" "}
          <span className="waterflow-footer-logo-icon">
            {" "}
            <Droplets size={25} />{" "}
          </span>{" "}
          <span>WaterFlow</span>{" "}
        </Link>
        <p>
          Fresh, clean water delivered to your doorstep. We make water delivery
          simple, reliable, and convenient for every home and business.
        </p>
        <div className="waterflow-footer-socials">
          <span>Clean water. Reliable delivery.</span>
        </div>
      </div>
      <div className="waterflow-footer-column">
        <h3>Services</h3>
        <Link to="/products">Order Water</Link>
        <Link to="/products">Our Products</Link>
        <Link to="/orders">My Orders</Link>
        <Link to="/subscriptions">Subscriptions</Link>
        <Link to="/cart">My Cart</Link>
        <Link to="/profile">My Profile</Link>
      </div>
      <div className="waterflow-footer-column">
        <h3>Company</h3>
        <Link to="/about">About Us</Link>
        <Link to="/mission">Our Mission</Link>
        <Link to="/why-waterflow">Why Choose WaterFlow</Link>
      </div>
      <div className="waterflow-footer-column waterflow-footer-contact">
        <h3>Help &amp; Contact</h3>

        <Link to="/help-support">Help &amp; Support</Link>
        <Link to="/contact">Contact Us</Link>

        <a href="mailto:support@waterflow.co.ke">
          <Mail size={16} />
          <span>support@waterflow.co.ke</span>
        </a>

        <a href="tel:+254700000000">
          <Phone size={16} />
          <span>+254 700 000 000</span>
        </a>

        <p>
          <MapPin size={18} />
          <span>Reliable water delivery to your doorstep.</span>
        </p>

        <Link to="/products" className="waterflow-footer-contact-link">
          Explore our products
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </div>
    <div className="waterflow-footer-bottom">
      <p>© {new Date().getFullYear()} WaterFlow. All rights reserved.</p>
      <p>Water delivery made simple.</p>
    </div>
  </footer>
);
}
