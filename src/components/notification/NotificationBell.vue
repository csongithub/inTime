<template>
  <q-btn flat round icon="notifications" @click="markReadAll">
    <!-- 🔴 Unread Badge -->
    <q-badge v-if="unreadCount > 0" color="red" floating>
      {{ unreadCount }}
    </q-badge>

    <!-- 📜 Dropdown -->
    <q-menu>
      <q-list style="min-width: 300px; max-height: 400px; overflow-y: auto">
        <q-item-label header>Notifications</q-item-label>

        <div v-if="notifications.length === 0">
          <q-item>
            <q-item-section>No notifications</q-item-section>
          </q-item>
        </div>

        <NotificationItem v-for="n in notifications" :key="n.id" :notification="n" />
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script>
import { useNotificationStore } from 'src/stores/notificationStore'
import NotificationItem from './NotificationItem.vue'
// import { auth } from 'src/firebase'
// import { db } from 'boot/firebase'
// import { ref, update } from 'firebase/database'
export default {
  name: 'NotificationBell',

  components: {
    NotificationItem,
  },

  data() {
    return {
      store: null,
    }
  },

  computed: {
    notifications() {
      return this.store.notifications
    },
    unreadCount() {
      return this.store.unreadCount
    },
  },

  created() {
    this.store = useNotificationStore()
  },

  methods: {
    async markReadAll() {
      //Uncomment this to make this work
      // const updates = {}
      // this.notifications.forEach((n) => {
      //   if (!n.read) {
      //     updates[`notifications/${auth.currentUser.uid}/${n.id}/read`] = true
      //   }
      // })
      // await update(ref(db), updates)
    },
  },
}
</script>
