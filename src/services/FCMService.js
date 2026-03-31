import { messaging, db } from 'src/boot/firebase'
import { getToken, onMessage } from 'firebase/messaging'
import { ref, set } from 'firebase/database'

const VAPID_KEY = import.meta.env.VITE_VAPID_KEY

export default {
  async init(userId) {
    try {
      const permission = await Notification.requestPermission()

      if (permission !== 'granted') return

      // ✅ Register service worker
      await navigator.serviceWorker.register('/firebase-messaging-sw.js')

      // ✅ Wait until it's ACTIVE
      const registration = await navigator.serviceWorker.ready

      // ✅ Now safe to get token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      })

      // console.log('FCM Token:', token)

      if (token) {
        await set(ref(db, `fcmTokens/${userId}`), {
          token,
          updatedAt: Date.now(),
        })
      }

      onMessage(messaging, (payload) => {
        console.log('Foreground message:', payload)

        // ✅ Show browser notification manually
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'Notification', {
            body: payload.notification?.body || '',
          })
        }
      })
    } catch (error) {
      console.error('FCM Error:', error)
    }
  },
}
