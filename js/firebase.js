import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBkKGgytdELAWzW0pypCYSqvJyACc1yn98",
  authDomain: "rose-produtos.firebaseapp.com",
  projectId: "rose-produtos",
  storageBucket: "rose-produtos.firebasestorage.app",
  messagingSenderId: "794373598349",
  appId: "1:794373598349:web:7cc702a65c01a764fd06c4",
  measurementId: "G-KPC6MS2J2W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
