// src/services/taskService.js

import { ref as dbRef, set, update, get, onValue, off } from 'firebase/database'
import { db } from 'boot/firebase'

/**
 * Create a new task
 */
async function createTask(communityId, taskData) {
  const communityRef = dbRef(db, `communities/${communityId}`)
  const snapshot = await get(communityRef)
  const community = snapshot.val()

  if (!community) throw new Error('Community not found')

  const prefix = community.taskPrefix || 'TS'
  const counter = (community.taskCounter || 0) + 1

  await update(communityRef, {
    taskCounter: counter,
  })

  const taskId = `${prefix}-${counter}`

  const taskRef = dbRef(db, `tasks/${communityId}/${taskId}`)

  const finalTaskData = {
    ...taskData,

    id: taskId,
    createdAt: Date.now(),
  }

  await set(taskRef, finalTaskData)

  return taskId
}

/**
 * Update task
 */
async function updateTask(communityId, taskId, data) {
  const taskRef = dbRef(db, `tasks/${communityId}/${taskId}`)
  await update(taskRef, data)
}

async function updateTaskStatus(communityId, taskId, status) {
  try {
    const taskRef = dbRef(db, `tasks/${communityId}/${taskId}`)
    const now = Date.now()
    let obj = {
      status: status,
      updatedAt: now,
    }

    if (status === 'Started') obj.startedAt = now
    if (status === 'Completed') obj.progress = 100
    if (status === 'Restarted') obj.progress = 0

    await update(taskRef, obj)

    console.log('Status updated successfully')
  } catch (error) {
    console.error('Error updating status:', error)
  }
}

/**
 * Real-time fetch tasks
 */
function subscribeToTasks(communityId, callback) {
  const tasksRef = dbRef(db, `tasks/${communityId}`)

  onValue(tasksRef, (snapshot) => {
    const data = snapshot.val() || {}
    callback(Object.values(data))
  })

  return () => off(tasksRef)
}

export default {
  createTask,
  updateTask,
  updateTaskStatus,
  subscribeToTasks,
}
