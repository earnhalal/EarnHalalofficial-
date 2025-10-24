// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClUJLYwy9SEjF_YERVTYuI-vlRFC31EPw",
  authDomain: "earnhalal-5105b.firebaseapp.com",
  projectId: "earnhalal-5105b",
  storageBucket: "earnhalal-5105b.firebasestorage.app",
  messagingSenderId: "1077759003577",
  appId: "1:1077759003577:web:bde4fe4da663e506780468",
  measurementId: "G-DQ43TYB9CN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
alert("🔥 Firebase Connected Successfully!");
