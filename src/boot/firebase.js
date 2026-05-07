import { boot } from 'quasar/wrappers'
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { getMessaging } from 'firebase/messaging'

/**
 * Uncomment the below configuration for dev
 */
const firebase_config_dev = {
  apiKey: 'AIzaSyBp9myCoK_SV4Y3sirL0gRsNn4cCr8OdI4',
  authDomain: 'task-12f91.firebaseapp.com',
  databaseURL: 'https://task-12f91-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'task-12f91',
  storageBucket: 'task-12f91.firebasestorage.app',
  messagingSenderId: '105465786949',
  appId: '1:105465786949:web:8cb198764688f285ffa92c',
}
const app = initializeApp(firebase_config_dev)

/**
 * Uncomment the below configuration for production
 */
// const firebase_config_prod = {
//   apiKey: 'AIzaSyDy4iA6HWWSfkcHzHZHnaqIxpakq9rZ9FU',
//   authDomain: 'intime-prod.firebaseapp.com',
//   databaseURL: 'https://intime-prod-default-rtdb.firebaseio.com/',
//   projectId: 'intime-prod',
//   storageBucket: 'intime-prod.firebasestorage.app',
//   messagingSenderId: '577842551018',
//   appId: '1:577842551018:web:deb7a4e4f28403cc2f1f93',
// }
// const app = initializeApp(firebase_config_prod)

export const db = getDatabase(app)
export const auth = getAuth(app)
export const messaging = getMessaging(app)

export default boot(() => {})
