import "./App.css";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
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
      const response = await fetch("http://localhost:5000/create-order", {
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
            const verifyRes = await fetch("http://localhost:5000/verify-payment", {
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
              await updateDoc(docRef, {
                donationsReceived: increment(selectedPackage.id),
                familiesHelped: increment(1),
                mealsDistributed: increment(selectedPackage.meals),
              });
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
    </div>
  );
}

export default App;
