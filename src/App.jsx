import "./App.css";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import logo from "./assets/foodboxlogo.png";
import food1 from "./assets/food1.png";
import food2 from "./assets/food2.png";
import food3 from "./assets/food3.png";
import food5 from "./assets/food5.png";

const packages = [
  { id: 500, meals: 15, perks: ["Photo of donation"] },
  { id: 750, meals: 22, perks: ["Photo + Video of donation"] },
  { id: 1000, meals: 30, perks: ["Donation with name/photo on packaging"] },
  { id: 2000, meals: 60, perks: ["Photo + Video + Name/photo on packaging or custom message"] },
  { id: 5000, meals: 300, perks: ["Photo + Video + Name/photo on packaging + Special Thanking video"] },
];

const loadRazorpay = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState(null);
  const [donationsCount, setDonationsCount] = useState(0);
  const [mealsDistributed, setMealsDistributed] = useState(0);
  const [donationsReceived, setDonationsReceived] = useState(0);

  useEffect(() => {
    const loadImpactData = async () => {
      try {
        const docRef = doc(db, "stats", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDonationsCount(data.familiesHelped || 0); // Will display as Donations
          setMealsDistributed(data.mealsDistributed || 0);
          setDonationsReceived(data.donationsReceived || 0);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadImpactData();
  }, []);

  const createOrder = async (selectedPackage) => {
    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    try {
      const response = await fetch("https://foodbox-foundation-backend.onrender.com/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedPackage.id }),
      });
      const data = await response.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Food Box Foundation",
        description: `Donation ₹${selectedPackage.id}`,
        order_id: data.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch("https://foodbox-foundation-backend.onrender.com/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                selectedPackage,
              }),
            });
            const result = await verifyRes.json();
         if (result.success) {
  alert("Payment verified successfully!");

  const docRef = doc(db, "stats", "main");
  const updatedDoc = await getDoc(docRef);

  if (updatedDoc.exists()) {
    const updatedData = updatedDoc.data();

    setDonationsCount(updatedData.familiesHelped || 0);
    setMealsDistributed(updatedData.mealsDistributed || 0);
    setDonationsReceived(updatedData.donationsReceived || 0);
  }
} else {
  alert("Payment verification failed!");
}
          } catch (err) {
            console.error("Verify payment error:", err);
            alert("Error verifying payment. Check console.");
          }
        },
        prefill: {
          name: "Your Name",
          email: "youremail@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Error creating order. Check console.");
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="Logo" className="logo" />
          <h2 className="site-title">Food Box Foundation</h2>
        </div>
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>☰</div>
        {menuOpen && (
          <div className="mobile-menu">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#donate">Donate</a>
            <a href="#gallery">Gallery</a>
            <a href="#volunteer">Volunteer</a>
            <a href="#contact">Contact</a>
            
          </div>
        )}
      </nav>

      <section className="hero" id="home">
        <h1>Food Box Foundation</h1>
        <h2>Every Donation Becomes a Meal</h2>
        <p>Join us in feeding families in need. Your contribution creates a direct impact.</p>
        <a href="#donate"><button className="hero-donate-btn">Donate Now</button></a>
      </section>
<section id="about" className="about">
  <h2>About Food Box Foundation</h2>

  <p>
      FoodBox Foundation is a non-profit, community-driven initiative dedicated to
    helping families facing food insecurity. Our mission is simple: no one
    should have to sleep with an empty stomach.
  </p>

  <p>
    Through the generosity of donors and the support of volunteers, we collect
    contributions and transform them into essential food supplies and grocery
    assistance for families in need. Every donation directly helps provide
    nourishment, hope, and dignity to people who are struggling to meet their
    daily food requirements.
  </p>

  <p>
    We are committed to transparency, accountability, and meaningful impact.
    Our goal is to ensure that every contribution is used responsibly to create
    real change within communities. By working together, we can reach more
    families and help reduce hunger one meal at a time.
  </p>

  <p>At FoodBox Foundation, we believe that access to food is a basic human
    necessity. Together, we can build a future where every family has the
    support they need to live with dignity, security, and hope.
    </p>
    <p> <strong>Together, we can make sure that no one goes hungry.</strong>
    </p>
</section>
      <section className="donation-packages" id="donate">
        <h2>Donation Packages</h2>
        <div className="package-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className="package-card">
              <h3>₹{pkg.id}</h3>
              <p>{pkg.meals} Meals</p>
              <ul>{pkg.perks.map((perk, i) => (<li key={i}>✅ {perk}</li>))}</ul>
              <button onClick={() => createOrder(pkg)}>Donate</button>
            </div>
          ))}
        </div>
      </section>

      <section className="impact">
        <h2>Impact Tracker</h2>
        <div className="stats">
          <div className="stat-card"><h3>{donationsCount}</h3><p>Donations</p></div>
          <div className="stat-card"><h3>{mealsDistributed}</h3><p>Meals Distributed</p></div>
          <div className="stat-card"><h3>₹{donationsReceived}</h3><p>Donations Received</p></div>
        </div>
      </section>

      <section id="gallery" className="gallery">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          <img src={food1} alt="Food Distribution 1" />
          <img src={food2} alt="Food Distribution 2" />
          <img src={food3} alt="Food Distribution 3" />
          <img src={food5} alt="Food Distribution 4" />
        </div>
      </section>

      <section id="volunteer" className="volunteer">
        <h2>Become a Volunteer</h2>
        <p>Join Food Box Foundation and help us serve families in need.</p>
        <a href="https://forms.gle/XgBAey8zCZ8w9rHw9" target="_blank" rel="noreferrer">
          <button>🚀 Apply as Volunteer</button>
        </a>
      </section>

      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <p>Name: sunny singh</p>
        <p>Email: paranthaaloo52@gmail.com</p>
        <p>Phone: +91 76339 14118</p>
        <p>Address: Patna, Bihar, 811104</p>
      </section>
     
<footer className="footer">
  <div className="footer-content">
    <h3>Food Box Foundation</h3>

    <p>
      Together, we can ensure that no one goes hungry.
    </p>

    <div className="footer-links">
      <a href="#" onClick={() => setActivePolicy("privacy")}>
        Privacy Policy
      </a>

      <a href="#" onClick={() => setActivePolicy("refund")}>
        Refund Policy
      </a>

      <a href="#" onClick={() => setActivePolicy("terms")}>
        Terms & Conditions
      </a>

      <a href="#contact">
        Contact
      </a>
    </div>

    <p className="copyright">
      © 2026 Food Box Foundation. All Rights Reserved.
    </p>
  </div>
</footer>

    
{activePolicy && (
  <div className="policy-modal-overlay">
    <div className="policy-modal">

      <button
        className="close-modal"
        onClick={() => setActivePolicy(null)}
      >
        ✕
      </button>

      {activePolicy === "privacy" && (
        <>
          <h2>Privacy Policy</h2>
          <p>
    Food Box Foundation respects your privacy and is committed to protecting
    your personal information.
  </p>

  <p>
    We may collect information such as your name, email address, phone number,
    and donation details solely for processing donations, communication, and
    improving our services.
  </p>

  <p>
    We do not sell, rent, or share your personal information with third
    parties except when required by law or necessary for payment processing.
  </p>

  <p>
    All donation transactions are processed through secure payment gateways.
    We take reasonable measures to protect your information from unauthorized
    access or disclosure.
  </p>

  <p>
    By using our website, you consent to this Privacy Policy and the collection
    of information as described above.
  </p>
        </>
      )}

      {activePolicy === "refund" && (
        <>
          <h2>Refund Policy</h2>
           <p>
    Food Box Foundation is committed to using donations responsibly for
    charitable and community welfare activities.
  </p>

  <p>
    Donations made through our website are generally considered voluntary and
    non-refundable. Once a donation has been processed successfully, it may not
    be eligible for cancellation or refund.
  </p>

  <p>
    However, if a donation has been made in error, duplicated accidentally, or
    an incorrect amount was charged, donors may contact us within 7 days of the
    transaction for review.
  </p>

  <p>
    Approved refund requests will be processed through the original payment
    method within a reasonable timeframe, subject to payment gateway and
    banking procedures.
  </p>

  <p>
    For refund-related queries, please contact us using the details provided in
    the Contact section of this website.
  </p>
        </>
      )}

      {activePolicy === "terms" && (
        <>
          <h2>Terms & Conditions</h2>
           <p>
    By accessing and using the Food Box Foundation website, you agree to
    comply with and be bound by these Terms & Conditions. If you do not agree
    with any part of these terms, please do not use this website.
  </p>

  <p>
    Food Box Foundation is a charitable initiative dedicated to supporting
    individuals and families facing food insecurity. All information provided
    on this website is for general informational purposes only and may be
    updated or modified without prior notice.
  </p>

  <p>
    Donations made through this website are voluntary contributions intended
    to support our charitable activities. While we strive to ensure that all
    funds are utilized effectively and transparently, specific allocation of
    donations may vary based on operational requirements and community needs.
  </p>

  <p>
    Users agree not to misuse this website, attempt unauthorized access,
    distribute harmful content, or engage in any activity that may disrupt the
    website's functionality or security.
  </p>

  <p>
    Food Box Foundation is not responsible for any indirect, incidental, or
    consequential damages arising from the use of this website or reliance on
    the information provided herein.
  </p>

  <p>
    We reserve the right to modify these Terms & Conditions at any time. Any
    changes will become effective immediately upon being published on this
    website.
  </p>

  <p>
    Continued use of the website after any updates constitutes acceptance of
    the revised Terms & Conditions.
  </p>
        </>
      )}

    </div>
  </div>
)}
    </div>
  );
}

export default App;
