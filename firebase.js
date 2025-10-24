// Import from npm package instead of CDN
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyClUJLYwy9SEjF_YERVTYuI-vlRFC31EPw",
  authDomain: "earnhalal-5105b.firebaseapp.com",
  projectId: "earnhalal-5105b",
  storageBucket: "earnhalal-5105b.firebasestorage.app",
  messagingSenderId: "1077759003577",
  appId: "1:1077759003577:web:bde4fe4da663e506780468",
  measurementId: "G-DQ43TYB9CN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
