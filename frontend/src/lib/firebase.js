import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBPtxoDG5MFsQSPcv1e31AoZjFqUzFRyII",
  authDomain: "skyshield-9242f.firebaseapp.com",
  projectId: "skyshield-9242f",
  storageBucket: "skyshield-9242f.firebasestorage.app",
  messagingSenderId: "245894754071",
  appId: "1:245894754071:web:10a9307afc546d944c5152"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);