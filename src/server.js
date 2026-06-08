import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

const serviceAccount = JSON.parse(
  fs.readFileSync("/etc/secrets/serviceAccountKey.json", "utf8")
);

const app = express();

app.use(cors());
app.use(express.json());

// Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
console.log("Firebase Project:", serviceAccount.project_id);
console.log("Client Email:", serviceAccount.client_email);
app.get("/", (req, res) => {
  res.send("Food Box Foundation Backend Running");
});

/* ==========================
   CREATE ORDER
========================== */

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    console.log("=================================");
    console.log("CREATE ORDER REQUEST");
    console.log("Amount Received:", amount);
    console.log("=================================");

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    console.log("ORDER CREATED:");
    console.log("Order ID:", order.id);
    console.log("Razorpay Amount:", order.amount);

    return res.json(order);
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
});

/* ==========================
   VERIFY PAYMENT
========================== */

app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      selectedPackage,
    } = req.body;

    console.log("=================================");
    console.log("VERIFY PAYMENT");
    console.log("Selected Package:", selectedPackage);
    console.log("=================================");

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    console.log("SECRET EXISTS:", !!process.env.RAZORPAY_KEY_SECRET);
console.log("KEY ID EXISTS:", !!process.env.RAZORPAY_KEY_ID);

const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(body)
  .digest("hex");
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const donationAmount = Number(selectedPackage?.id || 0);
    const meals = Number(selectedPackage?.meals || 0);

    console.log("Donation Amount:", donationAmount);
    console.log("Meals:", meals);

    const statsRef = db.collection("stats").doc("main");

    await statsRef.set(
      {
        donationsReceived: admin.firestore.FieldValue.increment(
          donationAmount
        ),
        mealsDistributed: admin.firestore.FieldValue.increment(meals),
        familiesHelped: admin.firestore.FieldValue.increment(1),
      },
      { merge: true }
    );

    console.log("FIRESTORE UPDATED SUCCESSFULLY");

    return res.json({
      success: true,
      donationAmount,
      meals,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
