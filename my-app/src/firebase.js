// src/firebase.js
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATM7BMiCUqw_P7YKOyNvzTY__k7gIkIJc",
  authDomain: "ourteamproject-2091d.firebaseapp.com",
  projectId: "ourteamproject-2091d",
  storageBucket: "ourteamproject-2091d.firebasestorage.app",
  messagingSenderId: "406655147662",
  appId: "1:406655147662:web:582f397d73f8ca729033df",
  measurementId: "G-Y7VDEK71Z3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 
export const db = getFirestore(app); 