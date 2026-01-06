import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your Firebase config
// Get this from Firebase Console → Project Settings → General → Your apps → Web app
const firebaseConfig = {
  apiKey: "AIzaSyB-g9YJiK69YtwebIb82IuG25y9z2pF0RU",
  authDomain: "mobile-app-e2482.firebaseapp.com",
  projectId: "mobile-app-e2482",
  storageBucket: "mobile-app-e2482.firebasestorage.app",
  messagingSenderId: "625996935776",
  appId: "1:625996935776:web:515cdc89cacf72b2c64905"
};

// Initialize Firebase
// Initialize Firebase
let app;
let auth;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

export { auth, db, storage };
export default app;