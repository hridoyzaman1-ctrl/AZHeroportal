
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAnvykM3AFXOrVdv1-CoZ0BrTl4KOxYMDA",
    authDomain: "flutter-ai-playground-76ba0.firebaseapp.com",
    projectId: "flutter-ai-playground-76ba0",
    storageBucket: "flutter-ai-playground-76ba0.firebasestorage.app",
    messagingSenderId: "271094869208",
    appId: "1:271094869208:web:59cd43a0b68e379aa0bbad"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
