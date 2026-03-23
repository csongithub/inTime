<template>
  <q-page class="">
    <!-- <div class="row q-gutter-sm q-mb-md">
      <q-chip clickable color="primary" text-color="white">My Tasks</q-chip>
      <q-chip clickable outline>Started</q-chip>
      <q-chip clickable outline>Completed</q-chip>
    </div> -->
    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-6 col-lg-4" v-for="task in taskStore.tasks" :key="task.id">
        <TaskCard
          :task="task"
          @edit="openEdit"
          @status-update="handleStatusUpdate"
          @discussion="openTaskDiscussion"
        />
      </div>
    </div>

    <TaskFormDialog v-model="dialog" :editTask="selectedTask" @save="handleSave" />

    <!-- <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <q-btn
        round
        dense
        icon="add"
        color="primary"
        size="20px"
        glossy
        class="premium-fab"
        @click="openCreate"
      />
    </q-page-sticky> -->
  </q-page>
</template>

<script>
import { useTaskStore } from 'src/stores/taskStore'
import TaskCard from '../../components/task/TaskCard.vue'
import TaskFormDialog from '../../components/task/TaskFormDialog.vue'
import event from 'src/utils/eventBus'
import { notifyTaskAssigned } from 'src/helpers/NotificationHelpers'

import { db } from 'src/boot/firebase'
import { ref, onValue } from 'firebase/database'
import { getAuth } from 'firebase/auth'
export default {
  components: { TaskCard, TaskFormDialog },

  data() {
    return {
      communityId: this.$route.params.id,
      dialog: false,
      selectedTask: null,
      currentUser: {
        id: 'user123',
        name: 'Chandan',
      },
    }
  },

  computed: {
    taskStore() {
      return useTaskStore()
    },
  },

  async mounted() {
    event.on('open-create-task', this.openCreate)
    this.taskStore.subscribe(this.communityId)
    this.getCurrentUser()
  },

  beforeUnmount() {
    event.off('open-create-task', this.openCreate)
    this.taskStore.unsubscribeListener()
  },

  methods: {
    getCurrentUser() {
      const auth = getAuth()
      const user = auth.currentUser

      const userRef = ref(db, `users/${user.uid}`)
      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          this.currentUser = {
            id: user.uid,
            ...snapshot.val(),
          }
          console.log(JSON.stringify(this.currentUser))
        } else {
          console.log('User not found')
        }
      })
    },
    openCreate() {
      this.selectedTask = null
      this.dialog = true
    },

    openEdit(task) {
      this.selectedTask = task
      this.dialog = true
    },
    async handleStatusUpdate({ taskId, status }) {
      // Call API or Firebase update here
      await this.taskStore.updateTaskStatus(this.communityId, taskId, status)
    },

    async handleSave(form) {
      if (this.selectedTask) {
        await this.taskStore.update(this.communityId, this.selectedTask.id, form)
      } else {
        const taskId = await this.taskStore.create(this.communityId, form)

        //Send Notification

        notifyTaskAssigned({
          userId: form.assigneeId,
          taskId: taskId,
          communityId: this.communityId,
          fromUser: this.currentUser,
        })
      }

      this.dialog = false
    },
    openTaskDiscussion(task) {
      this.$router.push({
        name: 'task-discussion',
        params: {
          communityId: this.communityId,
          taskId: task.id,
        },
      })
    },
  },
}
</script>
<style scoped>
.premium-fab {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  transition: all 0.2s ease;
}

.premium-fab:hover {
  transform: scale(1.1);
}
</style>
