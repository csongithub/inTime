import { messaging, db } from 'src/boot/firebase'
import { getToken, onMessage } from 'firebase/messaging'
import { ref, set } from 'firebase/database'
import { buildNotificationPath } from 'src/helpers/NotificationHelpers'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'
import router from 'src/router'

const VAPID_KEY = import.meta.env.VITE_VAPID_KEY

export default {
  async init(userId) {
    try {
      if (Capacitor.isNativePlatform()) {
        // ✅ MOBILE FLOW
        await this.initMobile(userId)
      } else {
        // ✅ WEB FLOW (your existing code)
        await this.initWeb(userId)
      }
    } catch (error) {
      console.error('FCM Error:', error)
    }
  },

  async initMobile(userId) {
    await PushNotifications.requestPermissions()

    // 🔊 CREATE CHANNEL (ADD THIS)
    await PushNotifications.createChannel({
      id: 'default_v2',
      name: 'Default Notifications',
      importance: 5,
      sound: 'notification_sound', // 🔥notification_sound.mp3 must be present in inTIME\android\app\src\main\res\raw
    })

    PushNotifications.register()

    // 🔑 Token received
    PushNotifications.addListener('registration', async (token) => {
      console.log('FCM Mobile Token:', token.value)

      await set(ref(db, `fcmTokens/${userId}/mobile`), {
        token: token.value,
        updatedAt: Date.now(),
      })
    })
    // ❗ Notification received (foreground)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Mobile Foreground:', notification)
      const data = notification.data || {}

      // 🔥 Manually show notification
      // PushNotifications.schedule({
      //   notifications: [
      //     {
      //       title: notification.title || data.title,
      //       body: notification.body || data.body,
      //       id: Date.now(),
      //       extra: data,
      //       sound: 'notification_sound', // 🔥 ADD THIS FOR SOUND
      //     },
      //   ],
      // })
      LocalNotifications.schedule({
        notifications: [
          {
            title: notification.title || data.title,
            body: notification.body || data.body,
            id: Date.now(),
            extra: data,
            sound: 'notification_sound',
          },
        ],
      })
    })

    // 🔥 CLICK HANDLING (MOST IMPORTANT)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      // const data = action.notification.data || {}
      // const finalUrl = buildNotificationPath(data, userId, data.notificationId)
      // router.push(finalUrl)
      const data = action.notification.data || {}

      const finalUrl = buildNotificationPath(data, userId, data.notificationId)

      // 🔥 FIX
      // setTimeout(() => {
      //   window.location.href = finalUrl
      // }, 500)
      setTimeout(() => {
        router.push(finalUrl)
      }, 500)
    })
  },

  async initWeb(userId) {
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

    console.log('FCM Web Token:', token)

    if (token) {
      await set(ref(db, `fcmTokens/${userId}/web`), {
        token,
        updatedAt: Date.now(),
      })
    }

    onMessage(messaging, (payload) => {
      console.log('Foreground message:', payload)

      const audio = new Audio('/sounds/notification_sound.mp3') //notification_sound.mp3 must be present at /inTIME\public\sound
      audio.play().catch(() => {})

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

          const finalUrl = buildNotificationPath(data, userId, data.notificationId)

          window.focus()
          window.location.href = finalUrl
        }
      }
    })
  },
}
