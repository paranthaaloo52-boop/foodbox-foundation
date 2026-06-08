import fetch from "node-fetch";

async function createOrder() {
  try {
    const response = await fetch("http://localhost:5000/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100 }),
    });

    const data = await response.json();
    console.log("Server response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

createOrder();