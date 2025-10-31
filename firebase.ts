// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp, increment, arrayUnion } from "firebase/firestore";

// Your web app's Firebase configuration from the prompt
const firebaseConfig = {
  apiKey: "AIzaSyCZJEJlevQr475TjkU5SjbSYk_S5bSkaiU",
  authDomain: "earnapp-f8d27.firebaseapp.com",
  projectId: "earnapp-f8d27",
  storageBucket: "earnapp-f8d27.appspot.com",
  messagingSenderId: "151886381795",
  appId: "1:151886381795:web:d76b5280b7c8cd30767bd6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export Firestore utility functions
export { serverTimestamp, increment, arrayUnion };
