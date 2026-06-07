
import "./App.css";
import logo from "./assets/foodboxlogo.png";

import food1 from "./assets/food1.png";
import food2 from "./assets/food2.png";
import food3 from "./assets/food3.png";
 
import food5 from "./assets/food5.png";

function App() {
  const donateLink = "https://rzp.io/rzp/NPDAAmIU";

  return (
    <div>
      <nav className="navbar">
        <div className="logo-section">
          <img src={logo} alt="Food Box Foundation" className="logo" />
        </div>

        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#donate">Donate</a>
        <a href="#gallery">Gallery</a>
        <a href="#volunteer">Volunteer</a>
        <a href="#contact">Contact</a>
      </nav>

      <section className="hero" id="home">
        <h1>Food Box Foundation</h1>
        <h2>Every Donation Becomes a Meal</h2>

        <p>
          We provide food assistance to families facing hardship and ensure
          that no one sleeps hungry.
        </p>

        <a href={donateLink} target="_blank" rel="noreferrer">
          <button>Donate Now</button>
        </a>
      </section>

      <section className="mission" id="about">
        <h2>About Food Box Foundation</h2>

        <p>
          Food Box Foundation is a community-driven initiative dedicated to
          helping families in need by providing meals, food kits, and grocery
          support. Every donation directly contributes to feeding people and
          creating a positive impact in local communities.
        </p>
      </section>

      <section className="impact">
        <h2>Impact Tracker</h2>

        <div className="stats">
          <div className="stat-card">
            <h3>0</h3>
            <p>Families Helped</p>
          </div>

          <div className="stat-card">
            <h3>0</h3>
            <p>Meals Distributed</p>
          </div>

          <div className="stat-card">
            <h3>0</h3>
            <p>Donations Received</p>
          </div>
        </div>

        <p className="note">
          Numbers will be updated as Food Box Foundation grows.
        </p>
      </section>

      <section className="packages" id="donate">
        <h2>Donation Packages</h2>

        <div className="package-grid">
          <div className="package-card">
            <h3>₹500</h3>
            <p>15 Meals + Photos</p>
            <a href={donateLink} target="_blank" rel="noreferrer">
              <button>Donate</button>
            </a>
          </div>

          <div className="package-card">
            <h3>₹750</h3>
            <p>22 Meals + Video</p>
            <a href={donateLink} target="_blank" rel="noreferrer">
              <button>Donate</button>
            </a>
          </div>

          <div className="package-card">
            <h3>₹1000</h3>
            <p>30 Meals + Personalised Packaging</p>
            <a href={donateLink} target="_blank" rel="noreferrer">
              <button>Donate</button>
            </a>
          </div>

          <div className="package-card">
            <h3>₹2000</h3>
            <p>60 Meals + Thank You Video</p>
            <a href={donateLink} target="_blank" rel="noreferrer">
              <button>Donate</button>
            </a>
          </div>

          <div className="package-card">
            <h3>₹5000</h3>
            <p>Monthly Grocery Support + Shoutout</p>
            <a href={donateLink} target="_blank" rel="noreferrer">
              <button>Donate</button>
            </a>
          </div>
        </div>
      </section>

      <section className="gallery-section" id="gallery">
        <h2>Our Gallery</h2>

        <div className="gallery-grid">
          <img src={food1} alt="Food Distribution 1" />
          <img src={food2} alt="Food Distribution 2" />
          <img src={food3} alt="Food Distribution 3" />
          
          <img src={food5} alt="Food Distribution 5" />
        </div>
      </section>

      <section className="volunteer" id="volunteer">
        <h2>Become a Volunteer</h2>

        <p>
          Join Food Box Foundation and help us serve families in need.
        </p>

        <a
          href="https://forms.gle/4zTtpGfM5NBaVEQT8"
          target="_blank"
          rel="noreferrer"
        >
          <button>🚀 Apply as Volunteer</button>
        </a>
      </section>

      <section className="contact" id="contact">
        <h2>Contact Us</h2>

        <div className="contact-card">
          <p><strong>Sunny Singh</strong></p>
          <p>📧 singhrajputsunny22@gmail.com</p>
          <p>📱 8789370138</p>
          <p>📍 Bihar, India</p>

          <a
            href="https://wa.me/918789370138"
            target="_blank"
            rel="noreferrer"
          >
            <button>💬 Chat on WhatsApp</button>
          </a>

          <a href={donateLink} target="_blank" rel="noreferrer">
            <button>❤️ Support Our Mission</button>
          </a>
        </div>
      </section>

      <footer className="footer">
        <h3>Food Box Foundation</h3>
        <p>Every Donation Becomes a Meal</p>
      </footer>
    </div>
  );
}

export default App;
