import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6l0I2puKzBbEb0MMVWfB1SlyTqf8FqV0",
  authDomain: "fintrack-plus-fbe63.firebaseapp.com",
  projectId: "fintrack-plus-fbe63",
  storageBucket: "fintrack-plus-fbe63.firebasestorage.app",
  messagingSenderId: "592703912480",
  appId: "1:592703912480:web:d07013e489f8ee58459a45",
  measurementId: "G-2TXSF4F6ST"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};