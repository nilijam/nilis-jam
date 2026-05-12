import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5U5vYj4IDHbdNSpReUBQuRQ5yOHrqM_0",
  authDomain: "nilsjam.firebaseapp.com",
  projectId: "nilsjam",
  storageBucket: "nilsjam.firebasestorage.app",
  messagingSenderId: "770586911795",
  appId: "1:770586911795:web:df08de8301f73c072d6f46"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
