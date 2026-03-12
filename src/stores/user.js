import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    uid: null,
    name: null,
    mobile: null,
  }),

  actions: {
    getUserId() {
      return this.uid
    },
    getUserName() {
      return this.name
    },
    setUser(user) {
      this.uid = user.uid
      this.name = user.name
      this.mobile = user.mobile
    },

    clearUser() {
      this.uid = null
      this.name = null
      this.mobile = null
    },
  },
})
