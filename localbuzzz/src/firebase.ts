import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBfy7lAOHpUAyULat-1Jfhd6U_aFB9F_0",
  authDomain: "localbuzz-29966.firebaseapp.com",
  projectId: "localbuzz-29966",
  storageBucket: "localbuzz-29966.firebasestorage.app",
  messagingSenderId: "452601612558",
  appId: "1:452601612558:web:b767ff948f32d83359ef5f",
  measurementId: "G-8QZ20WPSY3"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
