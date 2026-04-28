<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated reveal class="bg-primary text-white q-pt-xl">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> inTIME</q-toolbar-title>
        <!-- 🔔 Notification Bell -->
        <NotificationBell />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered elevated class="q-pt-lg">
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-avatar v-if="userStore.name" color="primary" text-color="white">
            {{ userStore.name.charAt(0) }}
          </q-avatar>
        </q-item-section>
        <q-item-section>{{ userStore.name }}</q-item-section>
      </q-item>

      <q-list bordered>
        <q-item clickable v-ripple @click="doLogout">
          <q-item-section avatar>
            <q-icon color="primary" name="logout" />
          </q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container :style="{ paddingBottom: safeBottom + 'px' }">
      <router-view />
    </q-page-container>
    <!-- Footer -->
    <q-footer bordered :style="footerStyle" class="bg-white">
      <div style="height: 56px"></div>
    </q-footer>
  </q-layout>
</template>

<script>
import { logout } from '../services/AuthService'
import { useUserStore } from 'src/stores/user'
import { useNotificationStore } from 'src/stores/notificationStore'
import { auth, db } from 'boot/firebase'
import { ref as dbRef, get } from 'firebase/database'
// import event from 'src/utils/eventBus'

import NotificationBell from 'src/components/notification/NotificationBell.vue'
import FCMService from 'src/services/FCMService'

export default {
  name: 'MainLayout',

  components: {
    NotificationBell,
  },

  data() {
    return {
      leftDrawerOpen: false,
      bottomInset: 0,
    }
  },

  computed: {
    userStore() {
      return useUserStore()
    },
    notificationStore() {
      return useNotificationStore()
    },
    safeBottom() {
      let inset = this.bottomInset

      if (inset < 30) {
        return 0
      }
      return Math.min(inset, 60) - 8
    },
    footerStyle() {
      let inset = this.bottomInset

      // ✅ Ignore fake/small insets (gesture mode)
      if (inset < 30) {
        inset = 0
      } else {
        // real nav bar → normalize
        inset = Math.min(inset, 60) - 8
      }

      return {
        paddingBottom: inset + 'px',
      }
    },
  },

  mounted() {
    const uid = auth.currentUser.uid

    //Initatite Firebase Cloud Messaging
    FCMService.init(uid)

    // Start Notification Listener
    this.notificationStore.startListener(uid)

    // Set Current User
    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const snapshot = await get(dbRef(db, `users/${uid}`))

        const user = snapshot.val()
        if (snapshot.exists()) {
          this.userStore.setUser({
            uid: uid,
            name: user.name,
            mobile: user.mobile,
          })
        } else {
          this.userStore.clearUser()
        }
      }
    })
  },

  methods: {
    // openCreateCommunity() {
    //   event.emit('open-create-community')
    // },
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },

    async doLogout() {
      this.notificationStore.stopListener()
      await logout()
      this.userStore.clearUser()
      this.$router.push('/')
    },
  },
}
</script>
<style scoped>
.glass-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 500;
}
</style>
