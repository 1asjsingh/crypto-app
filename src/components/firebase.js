// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZW_NkA8XONbZaPXzfW3-GCTihGZgK7Fs",
  authDomain: "crypto-project-21534.firebaseapp.com",
  projectId: "crypto-project-21534",
  storageBucket: "crypto-project-21534.appspot.com",
  messagingSenderId: "23963345596",
  appId: "1:23963345596:web:a28427ffb4413ae22e26b9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;