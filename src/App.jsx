import "./App.css";
import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  onSnapshot
} from "firebase/firestore";

import { db } from "./firebase";
import logo from "./assets/foodboxlogo.png";
import food1 from "./assets/food1.png";
import food2 from "./assets/food2.png";
import food3 from "./assets/food3.png";
import food5 from "./assets/food5.png";
import AdminDashboard from "./AdminDashboard";

const packages = [
  { id: 500, meals: 15, perks: ["Photos of donation"] },

  { id: 750, meals: 22, perks: ["Photos + Video of donation"] },

  {
    id: 1000,
    meals: 30,
    badge: "🔥 Most Popular",
    perks: ["Donation with name/photo on packaging"],
  },

  {
    id: 2000,
    meals: 60,
    badge: "⭐ Best Value",
    perks: [
      "Photo + Video + Name/photo on packaging or custom message",
    ],
  },

  {
    id: 5000,
    meals: 150,
    perks: [
      "Photo + Video + Name/photo on packaging + Special Thanking video",
    ],
  },
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
  const [showAdminLogin, setShowAdminLogin] = useState(false);
const [adminPassword, setAdminPassword] = useState("");
const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [donationsCount, setDonationsCount] = useState(0);
  const [mealsDistributed, setMealsDistributed] = useState(0);
  const [donationsReceived, setDonationsReceived] = useState(0);
const [showDetailsPopup, setShowDetailsPopup] = useState(false);
const [donorName, setDonorName] = useState("");
const [donorEmail, setDonorEmail] = useState("");
const [donorPhone, setDonorPhone] = useState("");
const [recentDonors, setRecentDonors] = useState([]);
const [selectedPackageForDonation, setSelectedPackageForDonation] = useState(null);
  useEffect(() => {
  const loadImpactData = async () => {
    try {
      const docRef = doc(db, "stats", "main");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setDonationsCount(data.familiesHelped || 0);
        setMealsDistributed(data.mealsDistributed || 0);
        setDonationsReceived(data.donationsReceived || 0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  loadImpactData();

  const unsubscribe = loadRecentDonors();

  return () => unsubscribe();

}, []);
const loadRecentDonors = () => {
  const donorsRef = collection(db, "donors");

  return onSnapshot(donorsRef, (snapshot) => {
    const donors = [];

    snapshot.forEach((doc) => {
      donors.push(doc.data());
    });

    donors.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    setRecentDonors(donors.slice(0, 5));
  });
};


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
  await setDoc(
  doc(db, "donors", response.razorpay_payment_id),
  {
    name: donorName,
    email: donorEmail,
    phone: donorPhone,

    amount: selectedPackage.id,
    meals: selectedPackage.meals,
    perks: selectedPackage.perks,

    paymentId: response.razorpay_payment_id,
    orderId: response.razorpay_order_id,

    createdAt: new Date().toISOString(),
  }
);

setDonorName("");
setDonorEmail("");
setDonorPhone("");
setSelectedPackageForDonation(null);
} else {
  alert("Payment verification failed!");
}
          } catch (err) {
            console.error("Verify payment error:", err);
            alert("Error verifying payment. Check console.");
          }
        },
        prefill: {
  name: donorName,
  email: donorEmail,
  contact: donorPhone,
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
  <>
    <div
      onClick={() => setMenuOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
      }}
    ></div>

    <div
  className="mobile-menu"
  onClick={(e) => e.stopPropagation()}
>
       <a
  href="#about"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById("about")?.scrollIntoView({
      behavior: "smooth",
    });
    setMenuOpen(false);
  }}
>
  About
</a>

<a
  href="#donate"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById("donate")?.scrollIntoView({
      behavior: "smooth",
    });
    setMenuOpen(false);
  }}
>
  Donate
</a>

<a
  href="#gallery"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById("gallery")?.scrollIntoView({
      behavior: "smooth",
    });
    setMenuOpen(false);
  }}
>
  Gallery
</a>

<a
  href="#volunteer"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById("volunteer")?.scrollIntoView({
      behavior: "smooth",
    });
    setMenuOpen(false);
  }}
>
  Volunteer
</a>

<a
  href="#contact"
  onClick={(e) => {
    e.preventDefault();
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
    });
    setMenuOpen(false);
  }}
>
  Contact
</a>
            
          </div>
  </>
)}
      </nav>

  <section className="hero" id="home">
  <div className="hero-overlay">
    <div className="hero-content">
      <h1>No Family Should Sleep Hungry Tonight</h1>

      <p>
        Food Box Foundation provides meals and groceries to families
        facing food insecurity. Every contribution creates a direct impact.
      </p>

      <div className="hero-buttons">
        <a href="#donate">
          <button className="hero-donate-btn">Donate Now</button>
        </a>

        <a href="#impact">
          <button className="hero-impact-btn">
  View Impact →
</button>
        </a>
      </div>

      
  </div>
  </div>
</section>    
<section id="about" className="about">
  <h2>About Food Box Foundation</h2>

  <p className="about-intro">
    FoodBox Foundation is a community-driven initiative dedicated to helping
    families facing food insecurity. Together, we work to ensure that no one
    has to sleep hungry.
  </p>

  <div className="mission-cards">

    <div className="mission-card">
     <h3>
  <span className="card-icon">🍲</span>
  Feed Families
</h3>
      <p>
        Helping provide meals and essential groceries to families in need.
      </p>
    </div>

    <div className="mission-card">
      <h3>
  <span className="card-icon">❤️</span>
  Direct Impact
</h3>
      <p>
        Every donation directly supports people facing food insecurity.
      </p>
    </div>

    <div className="mission-card">
      <h3>
  <span className="card-icon">🤝</span>
  Community Driven
</h3>
      <p>
        Powered by volunteers, donors, and supporters working together.
      </p>
    </div>

    <div className="mission-card">
    <h3>
  <span className="card-icon">🔍</span>
  Transparency
</h3>
      <p>
        Clear updates, accountability, and proof of impact for donations.
      </p>
    </div>

  </div>

  <p className="about-footer">
    <strong>Together, we can make sure that no one goes hungry.</strong>
  </p>
</section>
      <section className="donation-packages" id="donate">
        <h2>Donation Packages</h2>
        <div className="package-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className="package-card">
              {pkg.badge && (
  <div className="package-badge">
    {pkg.badge}
  </div>
)}
              <h3 className="package-price">
  ₹{pkg.id}
</h3>
            <div className="meal-badge">
  🍽 {pkg.meals} Meals
</div>  
              <ul>{pkg.perks.map((perk, i) => (<li key={i}>✅ {perk}</li>))}</ul>
           <button
  onClick={() => {
    setSelectedPackageForDonation(pkg);
    setShowDetailsPopup(true);
  }}
>
  Donate
</button>
            </div>
          ))}
        </div>
      </section>
<section id="impact" className="impact-heading">

  <h2>Our Impact So Far</h2>

  <p>Together, we are making a real difference</p>

</section>
      <div className="stats">

  <div className="stat-card donations-card">
    <h3>{donationsCount}</h3>
    <p>Donations</p>
  </div>

  <div className="stat-card meals-card">
    <h3>{mealsDistributed}</h3>
    <p>Meals Distributed</p>
  </div>

  <div className="stat-card received-card">
    <h3>₹{donationsReceived}</h3>
    <p>Donations Received</p>
  </div>

</div>
<section
  style={{
    padding: "60px 20px",
    background: "#f8fafc",
  }}
>
  <div className="donation-heading">
  <h2>🎁 Recent Donations</h2>
  <p>Thank you to our amazing donors</p>
</div>

  <div
    style={{
      maxWidth: "900px",
      margin: "0 auto",
      background: "white",
      borderRadius: "20px",
      padding: "20px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    }}
  >
   <div className="donation-cards">

  {recentDonors.map((donor, index) => (

    <div className="donation-card" key={index}>

      <div className="donor-avatar">
        {donor.name?.charAt(0).toUpperCase()}
      </div>

      <h4>{donor.name}</h4>

      <div className="donation-amount">
        ₹{donor.amount}
      </div>

      <p>
        🍽 {donor.meals} Meals Sponsored
      </p>

    </div>

  ))}


</div>
  </div>
</section>
     <section id="gallery" className="gallery premium-gallery">

  <div className="gallery-header">

    <div className="moments-heading">
      <h2>Moments of Impact</h2>
      <p>Smiles we create together</p>
    </div>

    <button className="view-photos-btn">
      📷 View All Photos
    </button>

  </div>

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

   <section id="contact" className="contact-section">

  <h2 className="contact-title">
    Contact Us
  </h2>

  <div className="contact-card-single">

  <h3>👤 Sunny Singh</h3>

  <p>📧 paranthaaloo52@gmail.com</p>

  <p>📍 Patna, Bihar, India</p>

  <a
  href="https://wa.me/917633914118"
  target="_blank"
  rel="noopener noreferrer"
  className="whatsapp-btn"
>
  💬 Chat on WhatsApp
</a>


</div>
</section>
    {!isAdminLoggedIn ? (
  <button
    onClick={() => setShowAdminLogin(true)}
    style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "55px",
      height: "55px",
      borderRadius: "50%",
      border: "none",
      background: "#1e3a8a",
      color: "white",
      fontSize: "26px",
      cursor: "pointer",
      boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
      zIndex: 9999,
    }}
  >
    ⚙️
  </button>
) : (
  <AdminDashboard />
)}
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
    </div>
    <p className="copyright">
      © 2026 Food Box Foundation. All Rights Reserved.
    </p>
  </div>
</footer>
{showDetailsPopup && (
  <div className="policy-modal-overlay">
    <div className="policy-modal donor-modal">
     <h2>💝 Donor Details</h2>

<p className="donor-subtitle">
  Your contribution helps provide food to families in need.
</p>

      <input
        type="text"
        placeholder="Your Name"
        value={donorName}
        onChange={(e) => setDonorName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Your Email"
        value={donorEmail}
        onChange={(e) => setDonorEmail(e.target.value)}
      />

      <input
        type="tel"
        placeholder="Your Phone Number"
        value={donorPhone}
        onChange={(e) => setDonorPhone(e.target.value)}
      />

      <button
        onClick={() => {
          if (!donorName || !donorEmail || !donorPhone) {
            alert("Please fill all details");
            return;
          }

          setShowDetailsPopup(false);
          createOrder(selectedPackageForDonation);
        }}
      >
        Proceed to Payment
      </button>
    </div>
  </div>
)}
 {showAdminLogin && (
  <div className="policy-modal-overlay">
    <div className="policy-modal">

      <h2>Admin Login</h2>

      <input
        type="password"
        placeholder="Enter Admin Password"
        value={adminPassword}
        onChange={(e) => setAdminPassword(e.target.value)}
      />

      <button
        onClick={() => {
          if (adminPassword === "foodbox123") {
            setIsAdminLoggedIn(true);
            setShowAdminLogin(false);
            setAdminPassword("");
          } else {
            alert("Wrong Password");
          }
        }}
      >
        Login
      </button>

      <button
        onClick={() => setShowAdminLogin(false)}
        style={{ marginTop: "10px" }}
      >
        Close
      </button>

    </div>
  </div>
)}   
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
