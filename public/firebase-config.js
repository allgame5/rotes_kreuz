import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAhj_c8zrE36vIJhdKfaqJ1q4eHAtE988k",
  authDomain: "rotes-kreuz-55946.firebaseapp.com",
  projectId: "rotes-kreuz-55946",
  storageBucket: "rotes-kreuz-55946.firebasestorage.app",
  messagingSenderId: "598428252142",
  appId: "1:598428252142:web:778af9eb1dcc2c303240ff",
  measurementId: "G-3T939H2848"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
