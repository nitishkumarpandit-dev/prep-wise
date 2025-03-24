import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWEImfK-bH9v4Eh6GSp4o4C41t_aN9Vts",
  authDomain: "prepwise-87480.firebaseapp.com",
  projectId: "prepwise-87480",
  storageBucket: "prepwise-87480.firebasestorage.app",
  messagingSenderId: "107970463004",
  appId: "1:107970463004:web:58c1c7f4dabaa10ca4a6d9",
  measurementId: "G-18M69W3E6L",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
