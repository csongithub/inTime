import NotificationServices from 'src/services/NotificationServices'

// 🔔 Mention
export const notifyMention = async ({ userIds, taskId, communityId, fromUser, commentId }) => {
  return NotificationServices.sendNotification(userIds, {
    type: 'MENTION',
    title: `${fromUser.name} mentioned you`,
    message: `in Task ${taskId}`,
    entityId: taskId,
    communityId,
    fromUserId: fromUser.id,
    commentId,
    body: `${fromUser.name} mentioned you ` + `in Task ${taskId}`,
  })
}

// 💬 Comment
export const notifyComment = async ({ userIds, taskId, communityId, fromUser, commentId }) => {
  return NotificationServices.sendNotification(userIds, {
    type: 'COMMENT',
    title: `${fromUser.name} commented`,
    message: `on Task ${taskId}`,
    entityId: taskId,
    fromUserId: fromUser.id,
    communityId,
    commentId,
    body: `${fromUser.name} commented ` + `on Task ${taskId}`,
  })
}

// 👤 Task Assigned
export const notifyTaskAssigned = async ({ userId, taskId, communityId, fromUser }) => {
  return NotificationServices.sendNotification([userId], {
    type: 'TASK_ASSIGNED',
    title: `${fromUser.name} assigned you a task`,
    message: `Task ${taskId}`,
    entityId: taskId,
    fromUserId: fromUser.id,
    communityId,
    body: `${fromUser.name} assigned you a task ` + `Task ${taskId}`,
  })
}

// 👥 Community Added
export const notifyCommunityAdd = async ({ userId, communityName, communityId }) => {
  return NotificationServices.sendNotification([userId], {
    type: 'COMMUNITY_ADDED',
    title: `You were added to community`,
    message: communityName,
    communityId,
    body: `You were added to community ${communityName}`,
  })
}
