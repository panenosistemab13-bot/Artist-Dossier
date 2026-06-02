import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAx1WoXq8SRF8-0-eb0m0GwAxRnLb74UNw",
  authDomain: "artist-dossier.firebaseapp.com",
  databaseURL: "https://artist-dossier-default-rtdb.firebaseio.com",
  projectId: "artist-dossier",
  storageBucket: "artist-dossier.firebasestorage.app",
  messagingSenderId: "691260580335",
  appId: "1:691260580335:web:74048b14b69e923fa1961a",
  measurementId: "G-3EL7EZZH5P"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
