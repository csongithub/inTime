/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyBp9myCoK_SV4Y3sirL0gRsNn4cCr8OdI4',
  authDomain: 'task-12f91.firebaseapp.com',
  projectId: 'task-12f91',
  messagingSenderId: '105465786949',
  appId: '1:105465786949:web:8cb198764688f285ffa92c',
})

const messaging = firebase.messaging()

// 🔔 Background Notification
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)

  const notificationTitle = payload.notification?.title || 'New Notification'
  const notificationOptions = {
    body: payload.notification?.body || '',
    data: payload.data || {},
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
