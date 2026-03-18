import { defineStore } from 'pinia'
import { db } from 'boot/firebase'
import { ref, onValue, off } from 'firebase/database'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    _ref: null,
  }),

  actions: {
    startListener(userId) {
      const notificationsRef = ref(db, `notifications/${userId}`)

      onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val() || {}

        const list = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }))

        list.sort((a, b) => b.createdAt - a.createdAt)

        this.notifications = list
        this.unreadCount = list.filter((n) => !n.read).length
      })

      this._ref = notificationsRef
    },

    stopListener() {
      if (this._ref) {
        off(this._ref)
      }
    },
  },
})
