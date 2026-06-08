import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOw27eZcU0rDWMwWmPLXyHRNy396l5thM",
  authDomain: "food-box-foundation-7ff36.firebaseapp.com",
  projectId: "food-box-foundation-7ff36",
  storageBucket: "food-box-foundation-7ff36.firebasestorage.app",
  messagingSenderId: "235183847586",
  appId: "1:235183847586:web:d4d29466d4729f6da47ffb",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);