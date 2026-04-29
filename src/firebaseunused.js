import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyBp9myCoK_SV4Y3sirL0gRsNn4cCr8OdI4',
  authDomain: 'task-12f91.firebaseapp.com',
  databaseURL: 'https://task-12f91-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'task-12f91',
  storageBucket: 'task-12f91.firebasestorage.app',
  messagingSenderId: '105465786949',
  appId: '1:105465786949:web:8cb198764688f285ffa92c',
}

// 🔥 Initialize immediately when file loads
const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getDatabase(app)

export { app, auth, db }
