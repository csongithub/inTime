// src/stores/taskStore.js

import { defineStore } from 'pinia'
import taskService from 'src/services/TaskService'
import { db, auth } from 'boot/firebase'
import { ref as dbRef, get } from 'firebase/database'

export const useTaskStore = defineStore('taskStore', {
  state: () => ({
    tasks: [],
    filteredTasks: [],
    unsubscribe: null,
    loading: false,
  }),

  getters: {
    /**
     * Generic filtered tasks getter
     */
    getTasks: (state) => {
      return (filters = {}) => {
        // This is for all task (by defalt filter)
        let result = [...state.tasks]

        // const currentUserId = auth.currentUser?.uid

        // 🔹 Member Filter
        if (filters.memberId && filters.memberId !== 'all') {
          result = result.filter((t) => t.assigneeId === filters.memberId)
        }

        // 🔹 Task Filter
        switch (filters.type) {
          case 'not started':
            result = result.filter((t) => t.status === 'Not Started')
            break
          case 'started':
            result = result.filter(
              (t) => t.status === 'Started' || t.status === 'Restarted' || t.status === 'Resumed',
            )
            break

          case 'blocked':
            result = result.filter((t) => t.status === 'Blocked')
            break

          case 'completed':
            result = result.filter((t) => t.status === 'Completed')
            break
        }

        return result
      }
    },
    myTasks: (state) => state.tasks.filter((t) => t.assigneeId === auth.currentUser?.uid),

    createdByMe: (state) => state.tasks.filter((t) => t.creatorId === auth.currentUser?.uid),

    completedTasks: (state) => state.tasks.filter((t) => t.status === 'Completed'),

    startedTasks: (state) => state.tasks.filter((t) => t.status === 'Started'),
  },

  actions: {
    /**
     * Start real-time listener
     */

    subscribe(communityId) {
      this.loading = true

      if (this.unsubscribe) {
        this.unsubscribe()
      }

      this.unsubscribe = taskService.subscribeToTasks(communityId, async (tasks) => {
        if (!tasks.length) {
          this.tasks = []
          this.loading = false
          return
        }

        // 1️⃣ Collect unique assigneeIds
        const assigneeIds = [...new Set(tasks.map((t) => t.assigneeId).filter(Boolean))]

        // 2️⃣ Fetch only required users
        const userMap = {}

        await Promise.all(
          assigneeIds.map(async (uid) => {
            const snap = await get(dbRef(db, `users/${uid}`))
            if (snap.exists()) {
              userMap[uid] = snap.val().name
            }
          }),
        )

        // 3️⃣ Attach assigneeName to tasks
        this.tasks = tasks.map((task) => ({
          ...task,
          assigneeName: task.assigneeId ? userMap[task.assigneeId] || 'Unknown' : null,
        }))

        this.loading = false
      })
    },

    /**
     * Stop listener
     */
    unsubscribeListener() {
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }
    },

    /**
     * Create Task
     */
    async create(communityId, formData) {
      const user = auth.currentUser

      const isAssigned = !!formData.assigneeId

      const payload = {
        ...formData,

        // Always set creator
        creatorId: user.uid,
        creatorName: user.displayName || null,

        // Only set assignedBy if task is assigned
        //Just to be safer side if isAssigned is false then assign null
        assigneeId: isAssigned ? formData.assigneeId : null,
        // assignedById: isAssigned ? user.uid : null,

        status: 'Not Started',
      }

      return await taskService.createTask(communityId, payload)
    },

    /**
     * Update Task
     */
    async update(communityId, taskId, data) {
      await taskService.updateTask(communityId, taskId, data)
    },

    async updateTaskStatus(communityId, taskId, status) {
      await taskService.updateTaskStatus(communityId, taskId, status)
    },
  },
})
