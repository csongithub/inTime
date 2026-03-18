import { db } from '/src/boot/firebase.js'
import { ref, push, update } from 'firebase/database'

export default {
  async sendNotification(userIds, payload) {
    const updates = {}

    userIds.forEach((uid) => {
      const notifListRef = ref(db, `notifications/${uid}`)

      // generate new child with unique key
      const newNotifRef = push(notifListRef)

      updates[`notifications/${uid}/${newNotifRef.key}`] = {
        ...payload,
        createdAt: Date.now(),
        read: false,
      }
    })

    // multi-location update
    return update(ref(db), updates)
  },
}
