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

<script>
import { db } from 'boot/firebase'
import { ref, update } from 'firebase/database'
import { auth } from 'src/firebase'

export default {
  name: 'NotificationItem',

  props: {
    notification: {
      type: Object,
      required: true,
    },
  },

  computed: {
    // 🎯 Dynamic icon based on type
    icon() {
      const iconMap = {
        MENTION: 'alternate_email',
        TASK_ASSIGNED: 'assignment_ind',
        COMMENT: 'chat',
        COMMUNITY_ADDED: 'group',
      }

      return iconMap[this.notification.type] || 'notifications'
    },
  },

  methods: {
    // 📌 Handle click
    async handleClick() {
      const uid = auth.currentUser.uid
      const notificationId = this.notification.id

      try {
        // mark as read
        await update(ref(db, `notifications/${uid}/${notificationId}`), { read: true })

        // TODO: navigate to task (next step)
        // ✅ Step 1: Navigate to task page

        let path = `/community/${this.notification.communityId}`

        if (
          this.notification.type === 'MENTION' ||
          this.notification.type === 'COMMENT' ||
          this.notification.type === 'TASK_ASSIGNED'
        ) {
          path = path + `/task/${this.notification.entityId}`
        } else if (this.notification.type === 'COMMUNITY_ADDED') {
          path = path + `/users`
        }

        this.$router.push({
          path: path,
          query: {
            commentId: this.notification.commentId,
          },
        })
      } catch (err) {
        console.error('Error updating notification:', err)
      }
    },
  },
}
</script>
