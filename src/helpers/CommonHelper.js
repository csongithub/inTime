import NotificationServices from 'src/services/NotificationServices'
import { db } from 'src/boot/firebase'
import { ref, onValue } from 'firebase/database'
import { getAuth } from 'firebase/auth'

// 🔔 Mention
export const notifyMention = async ({ userIds, taskId, communityId, fromUser }) => {
  return NotificationServices.sendNotification(userIds, {
    type: 'MENTION',
    title: `${fromUser.name} mentioned you`,
    message: `in Task ${taskId}`,
    entityId: taskId,
    communityId,
    fromUserId: fromUser.id,
  })
}

export const currentUser = () => {
  const auth = getAuth()
  const user = auth.currentUser

  const userRef = ref(db, `users/${user.uid}`)
  onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      return {
        id: user.uid,
        ...snapshot.val(),
      }
    } else {
      console.log('Current User not found')
    }
  })
}
