import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, collection, getDocs, query, orderBy, limit 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export { 
  doc, setDoc, getDoc, updateDoc, onSnapshot, collection, getDocs, query, orderBy, limit,
  signInWithPopup, signOut, signInAnonymously, onAuthStateChanged
};
export type { User };
