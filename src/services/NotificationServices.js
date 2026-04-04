import { db } from '/src/boot/firebase.js'
import { ref, push, update } from 'firebase/database'
// import API from 'src/config/api'
export default {
  async sendNotificationOld(userIds, payload) {
    try {
      const updates = {}

      userIds.forEach((uid) => {
        const notifListRef = ref(db, `notifications/${uid}`)
        const newNotifRef = push(notifListRef)

        updates[`notifications/${uid}/${newNotifRef.key}`] = {
          ...payload,
          createdAt: Date.now(),
          read: false,
        }
      })

      await update(ref(db), updates)
    } catch (error) {
      console.error('Notification Error:', error)
      throw error
    }
  },

  async sendNotification(userIds, payload) {
    try {
      const notificationAPI = `${import.meta.env.VITE_API_BASE_URL}/sendNotification`
      console.log('API URL:', notificationAPI)
      const res = await fetch(notificationAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds, payload }),
      })

      const data = await res.json()

      console.log('Notification API Response:', data)

      if (!res.ok) {
        throw new Error(data.error || 'Notification API failed')
      }
    } catch (error) {
      console.error('❌ Notification Error:', error)
    }
  },
}
