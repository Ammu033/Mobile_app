import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { 
  initializeAuth, 
  getReactNativePersistence 
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth with React Native persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  
  db = getFirestore(app);
  storage = getStorage(app);
  
  console.log('✅ Firebase initialized for Expo Go');
} else {
  app = getApps()[0];
}

export { auth, db, storage };
export default app;