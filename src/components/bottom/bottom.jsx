import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCode,
  FaHeart,
} from "react-icons/fa";
import "./footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* <div className="footer-container"> */}
        {/* Company Info */}
        {/* <div className="footer-section">
          <h3 className="footer-title">FDC Courier & Cargo</h3>
          <p className="footer-description">
            Fast, reliable, and secure courier services for all your shipping
            needs.
          </p>
          <div className="footer-contact">
            <div className="footer-contact-item">
              <FaMapMarkerAlt className="footer-icon" />
              <span>Srikakulam, Andhra Pradesh</span>
            </div>
            <div className="footer-contact-item">
              <FaPhone className="footer-icon" />
              <span>+91 1234567890</span>
            </div>
            <div className="footer-contact-item">
              <FaEnvelope className="footer-icon" />
              <span>info@fdccourier.com</span>
            </div>
          </div>
        </div> */}

        {/* Quick Links */}
        {/* <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li>
              <a href="/track">Track Shipment</a>
            </li>
            <li>
              <a href="/booking">Book Shipment</a>
            </li>
            <li>
              <a href="/about">About Us</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div> */}

        {/* Services
        <div className="footer-section">
          <h3 className="footer-title">Our Services</h3>
          <ul className="footer-links">
            <li>Domestic Shipping</li>
            <li>Express Delivery</li>
            <li>Air Cargo</li>
            <li>Surface Transport</li>
          </ul>
        </div> */}

        {/* Developer Info */}
        {/* <div className="footer-section">
          <h3 className="footer-title">
            <FaCode className="footer-icon" />
            Developed By
          </h3>
          <div className="developer-info">
            <p className="developer-name">Your Name</p>
            <p className="developer-role">Full Stack Developer</p>
            <div className="developer-social">
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
              <a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="mailto:your.email@example.com"
                className="social-link"
                aria-label="Email"
              >
                <FaEnvelope />
              </a>
            </div>
          </div>
        </div>
      </div> */}

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright">
            © {currentYear} FDC Courier & Cargo. All rights reserved.
          </p>
          <p className="made-with">
            Developed by <a href="https://www.dharmatejan.in" target="new" style={{color:"white",textDecoration:"underline"}}>DHARMA TEJA NERALLA</a> <FaHeart className="heart-icon" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
