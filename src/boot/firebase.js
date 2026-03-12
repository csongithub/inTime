import { boot } from 'quasar/wrappers'
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyBp9myCoK_SV4Y3sirL0gRsNn4cCr8OdI4',
  authDomain: 'task-12f91.firebaseapp.com',
  databaseURL: 'https://task-12f91-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'task-12f91',
  storageBucket: 'task-12f91.firebasestorage.app',
  messagingSenderId: '105465786949',
  appId: '1:105465786949:web:8cb198764688f285ffa92c',
}

const app = initializeApp(firebaseConfig)

export const db = getDatabase(app)
export const auth = getAuth(app)

export default boot(() => {})
