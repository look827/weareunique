import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  "projectId": "studio-8277363755-4c2a2",
  "appId": "1:216727523191:web:e2175a22c118a6669a1b72",
  "apiKey": "AIzaSyBd8hMkCmlvFinA9JyjpoDRcWf0YzqpVa4",
  "authDomain": "studio-8277363755-4c2a2.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "216727523191"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
