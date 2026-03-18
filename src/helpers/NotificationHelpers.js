import NotificationServices from 'src/services/NotificationServices'

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

// 👤 Task Assigned
export const notifyTaskAssigned = async ({ userId, taskId, fromUser }) => {
  return NotificationServices.sendNotification([userId], {
    type: 'TASK_ASSIGNED',
    title: `${fromUser.name} assigned you a task`,
    message: `Task ${taskId}`,
    entityId: taskId,
    fromUserId: fromUser.id,
  })
}

// 💬 Comment
export const notifyComment = async ({ userIds, taskId, fromUser }) => {
  return NotificationServices.sendNotification(userIds, {
    type: 'COMMENT',
    title: `${fromUser.name} commented`,
    message: `on Task ${taskId}`,
    entityId: taskId,
    fromUserId: fromUser.id,
  })
}

// 👥 Community Added
export const notifyCommunityAdd = async ({ userId, communityName }) => {
  return NotificationServices.sendNotification([userId], {
    type: 'COMMUNITY_ADDED',
    title: `You were added to community`,
    message: communityName,
  })
}
