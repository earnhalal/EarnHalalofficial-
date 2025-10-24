 </div>
    );
};

import React, { useEffect, useState } from "react";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { app } from "./firebase";

const App = () => {
  const [message, setMessage] = useState("⏳ Testing Firebase...");
  const db = getFirestore(app);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        const docRef = await addDoc(collection(db, "testCollectionMobile"), {
          name: "Earn Halal",
          message: "🔥 Firebase Firestore working on mobile!",
          time: new Date().toISOString(),
        });

        const querySnapshot = await getDocs(collection(db, "testCollectionMobile"));
        let dataList = [];
        querySnapshot.forEach((doc) => {
          dataList.push(doc.data());
        });

        setMessage(`✅ Firestore Connected!\nDocs in collection: ${dataList.length}`);
        alert("✅ Firebase Firestore working perfectly!");
      } catch (e) {
        console.error("Error testing Firestore:", e);
        setMessage("❌ Firestore connection failed!");
        alert("❌ Firestore test failed — check Firebase console");
      }
    };

    testFirebase();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>📲 Firebase Firestore Test (Mobile)</h2>
      <p>{message}</p>
    </div>
  );
};

export default App;export default App;
