
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXD_8H5LFy6IaW3LU94mBLyZqnJPkDED0",
  authDomain: "pinellascivicsurvey.firebaseapp.com",
  projectId: "pinellascivicsurvey",
  storageBucket: "pinellascivicsurvey.firebasestorage.app",
  messagingSenderId: "489151190766",
  appId: "1:489151190766:web:40627373e86da0305145ff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };