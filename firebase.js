// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDv7PKgvrblMfEvoyEhGKWC79YHKoMAUsY",
    authDomain: "unimaruko-comments.firebaseapp.com",
    projectId: "unimaruko-comments",
    storageBucket: "unimaruko-comments.firebasestorage.app",
    messagingSenderId: "814393627445",
    appId: "1:814393627445:web:9d5bcf66c0d5a0be92727c",
    measurementId: "G-Q73Z876HZT",
};

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export const db = getFirestore(app);

