<template>
  <q-btn flat round icon="notifications">
    <!-- 🔴 Unread Badge -->
    <q-badge v-if="store.unreadCount > 0" color="red" floating>
      {{ store.unreadCount }}
    </q-badge>

    <!-- 📜 Dropdown -->
    <q-menu>
      <q-list style="min-width: 300px; max-height: 400px; overflow-y: auto">
        <q-item-label header>Notifications</q-item-label>

        <div v-if="store.notifications.length === 0">
          <q-item>
            <q-item-section>No notifications</q-item-section>
          </q-item>
        </div>

        <NotificationItem v-for="n in store.notifications" :key="n.id" :notification="n" />
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup>
import { useNotificationStore } from 'src/stores/notificationStore'
import NotificationItem from './NotificationItem.vue'

const store = useNotificationStore()
</script>
