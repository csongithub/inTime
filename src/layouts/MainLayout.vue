<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated reveal class="bg-primary text-white q-pt-lg">
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

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted } from 'vue'
import { ref } from 'vue'
import { logout } from '../services/AuthService'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user'
import { ref as dbRef, get } from 'firebase/database'
import { auth, db } from 'boot/firebase'
import { useNotificationStore } from 'src/stores/notificationStore'

import NotificationBell from 'src/components/notification/NotificationBell.vue'

const userStore = useUserStore()
const router = useRouter()
const leftDrawerOpen = ref(false)
const notificationStore = useNotificationStore()

onMounted(() => {
  const uid = auth.currentUser.uid

  //Start Notification Listerner
  notificationStore.startListener(uid)

  //Set Current User
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const snapshot = await get(dbRef(db, `users/${uid}`))

      const user = snapshot.val()
      if (snapshot.exists()) {
        userStore.setUser({
          uid: uid,
          name: user.name,
          mobile: user.mobile,
        })
      } else {
        userStore.clearUser()
      }
    }
  })
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function doLogout() {
  notificationStore.stopListener()
  await logout()
  userStore.clearUser()
  router.push('/')
}
</script>
