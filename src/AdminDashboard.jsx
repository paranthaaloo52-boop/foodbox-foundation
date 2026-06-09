import React, { useEffect, useState } from "react";
import { db } from "./firebase"; // ye tumhare Firebase config file ka path hai
import {
  doc,
  getDoc,
  collection,
  getDocs,
  deleteDoc
} from "firebase/firestore";

const AdminDashboard = () => {
const [isAuthenticated, setIsAuthenticated] = useState(
  localStorage.getItem("adminLoggedIn") === "true"
);  
const [password, setPassword] = useState("");
  const [stats, setStats] = useState({
    donationsReceived: 0,
    mealsDistributed: 0,
    familiesHelped: 0,
  });
  const [donors, setDonors] = useState([]);

  // Firebase se stats fetch karna
  const fetchStats = async () => {
    const docRef = doc(db, "stats", "main");
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  const data = docSnap.data();

  setStats({
    donationsReceived: data.donationsReceived || 0,
    mealsDistributed: data.mealsDistributed || 0,
    familiesHelped: data.familiesHelped || 0,
  });
}
  };

  // Firebase se recent donors fetch karna
  const fetchDonors = async () => {
    const donorsCol = collection(db, "donors");
    const donorsSnapshot = await getDocs(donorsCol);
    const donorsList = [];
   donorsSnapshot.forEach((doc) => {
  donorsList.push({
    id: doc.id,
    ...doc.data(),
  });
});
    // latest 5 donors
    donorsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
   setDonors(donorsList);
  };

  useEffect(() => {
    fetchStats();
    fetchDonors();
  }, []);
if (!isAuthenticated) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#0f172a,#1e3a8a)",
        padding: "40px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "55px",
            marginBottom: "20px",
          }}
        >
          🔐
        </div>


        <h1
          style={{
            color: "#1e3a8a",
            marginBottom: "10px",
            fontSize: "28px",
lineHeight: "1.2",
          }}
        >
          Admin Dashboard
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "30px",
          }}
        >
          Authorized access only
        </p>

        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            marginBottom: "20px",
            fontSize: "16px",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={() => {
if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
  localStorage.setItem("adminLoggedIn", "true");
  setIsAuthenticated(true);
}
             else {
              alert("Wrong Password");
            }
          }}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "12px",
            background:
              "linear-gradient(135deg,#1e3a8a,#2563eb)",
            color: "white",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Login to Dashboard
        </button>

        <p
          style={{
            marginTop: "20px",
            color: "#94a3b8",
            fontSize: "13px",
          }}
        >
          Food Box Foundation Admin Portal
        </p>
      </div>
    </div>
  );
}
return (
  <div style={{ padding: "20px", fontFamily: "Arial" }}>
    <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
  }}
>
  <button
    onClick={() => {
      localStorage.removeItem("adminLoggedIn");
      setIsAuthenticated(false);
    }}
    style={{
      background: "#dc2626",
      color: "white",
      border: "none",
      padding: "10px 18px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "600",
    }}
  >
    Logout 🚪
  </button>
</div>
    <h1
      style={{
  textAlign: "center",
  marginTop: "40px",
  marginBottom: "30px",
  color: "#1e3a8a",
  fontSize: "36px",
  fontWeight: "700",
}}>
      Donation Activity
    </h1>
<p
  style={{
    textAlign: "center",
    color: "#64748b",
    marginTop: "-10px",
    marginBottom: "30px",
  }}
>
  Latest verified donations received through Food Box Foundation
</p>
<div
  style={{
    maxWidth: "300px",
    margin: "0 auto 35px",
    background: "white",
    padding: "20px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  }}
>
  <h2
    style={{
      color: "#2563eb",
      fontSize: "38px",
      margin: 0,
    }}
  >
    {donors.length}
  </h2>

  <p
    style={{
      marginTop: "8px",
      color: "#64748b",
      fontWeight: "600",
    }}
  >
    Total Donors
  </p>
</div>    

    <h2
      style={{
        textAlign: "center",
        marginTop: "30px",
        marginBottom: "20px",
        color: "#1e3a8a",
      }}
    >
      Recent Donations
    </h2>

    <div
     style={{
  backgroundColor: "#ffffff",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
  maxWidth: "900px",
  margin: "0 auto",
}}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr
            style={{
             background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              color: "white",
              height: "55px",
            }}
          >
            <th style={{ padding: "16px" }}>Name</th>
<th style={{ padding: "16px" }}>Email</th>
<th style={{ padding: "16px" }}>Phone</th>
<th style={{ padding: "16px" }}>Amount</th>
<th style={{ padding: "16px" }}>Meals</th>
          </tr>
        </thead>

        <tbody>
          {donors.map((donor, index) => (
           <tr
  key={index}
  style={{
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
  }}
>
  <td style={{ padding: "14px", textAlign: "center" }}>{donor.name}</td>
  <td style={{ padding: "14px", textAlign: "center" }}>{donor.email}</td>
  <td style={{ padding: "14px", textAlign: "center" }}>
  {donor.phone}
</td>
  <td style={{ padding: "14px", textAlign: "center", fontWeight: "600" }}>
    ₹ {donor.amount}
  </td>
  <td style={{ padding: "14px", textAlign: "center" }}>{donor.meals}</td>
</tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}
export default AdminDashboard;