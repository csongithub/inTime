import { messaging, db } from 'src/boot/firebase'
import { getToken, onMessage } from 'firebase/messaging'
import { ref, set } from 'firebase/database'
import { buildNotificationPath } from 'src/helpers/NotificationHelpers'

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

        if (Notification.permission === 'granted') {
          const notification = new Notification(payload.data?.title || 'Notification', {
            body: payload.data?.body || '',
            icon: '/icons/logo.png',
            data: payload.data, // 🔥 attach data
          })

          // 🔥 HANDLE CLICK HERE
          notification.onclick = function (event) {
            event.preventDefault()

            const data = notification.data || {}

            const finalUrl = buildNotificationPath(data)

            window.focus()
            window.location.href = finalUrl
          }
        }
      })
    } catch (error) {
      console.error('FCM Error:', error)
    }
  },
}
