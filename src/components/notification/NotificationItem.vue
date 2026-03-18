<template>
  <q-item clickable @click="handleClick">
    <!-- Left Icon -->
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <!-- Content -->
    <q-item-section>
      <q-item-label>{{ notification.title }}</q-item-label>
      <q-item-label caption>{{ notification.message }}</q-item-label>
    </q-item-section>

    <!-- Unread Dot -->
    <q-item-section side v-if="!notification.read">
      <q-icon name="circle" color="primary" size="8px" />
    </q-item-section>
  </q-item>
</template>

<script setup>
import { db } from 'boot/firebase'
import { useNotificationStore } from 'src/stores/notificationStore'

const props = defineProps({
  notification: Object,
})

const store = useNotificationStore()

// 🎯 Dynamic icon based on type
const iconMap = {
  MENTION: 'alternate_email',
  TASK_ASSIGNED: 'assignment_ind',
  COMMENT: 'chat',
  COMMUNITY_ADDED: 'group',
}

const icon = iconMap[props.notification.type] || 'notifications'

// 📌 Handle click
const handleClick = async () => {
  const uid = store.$state?.currentUserId || 'yourUserId'

  // mark as read
  await db.ref(`notifications/${uid}/${props.notification.id}`).update({
    read: true,
  })

  // TODO: navigate to task (next step)
}
</script>
