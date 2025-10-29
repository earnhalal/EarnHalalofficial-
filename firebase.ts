// firebase.ts

// Since we are using the CDN, firebase is available on the window object
const firebaseApp = (window as any).firebase;

export const auth = firebaseApp.auth();
export const db = firebaseApp.firestore();
export const serverTimestamp = firebaseApp.firestore.FieldValue.serverTimestamp;
export const increment = firebaseApp.firestore.FieldValue.increment;
export const arrayUnion = firebaseApp.firestore.FieldValue.arrayUnion;

export default firebaseApp;
