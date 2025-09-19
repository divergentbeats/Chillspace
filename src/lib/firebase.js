
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration (hardcoded as provided)
const firebaseConfig = {
  apiKey: "AIzaSyBFlW5WWQnnvwCmEThwrlx4AW-jfUVhUk4",
  authDomain: "chillspace-f5c3d.firebaseapp.com",
  projectId: "chillspace-f5c3d",
  storageBucket: "chillspace-f5c3d.firebasestorage.app",
  messagingSenderId: "461066592457",
  appId: "1:461066592457:web:6d0ee4b1fd11dfb7312d18",
  measurementId: "G-NZ1DV53E2X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
const db = getFirestore(app);
const functions = getFunctions(app);

export { auth, googleProvider, analytics, db, functions };
