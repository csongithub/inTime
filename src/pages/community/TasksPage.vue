<template>
  <q-page class="">
    <!-- 🔹 Member Filters -->
    <div class="q-mt-xs row no-wrap scroll hide-scrollbar items-center q-gutter-sm">
      <q-chip
        v-for="member in members"
        :key="member.id"
        clickable
        :class="selectedMember === member.uid ? 'chip-active' : 'chip-inactive'"
        @click="selectedMember = member.uid"
        square
      >
        <!-- <q-avatar size="24px">
          {{ member.name.charAt(0) }}
        </q-avatar> -->
        {{ member.name }}
      </q-chip>
    </div>
    <div class="q-mt-xs row no-wrap scroll hide-scrollbar items-center q-gutter-sm">
      <q-chip
        v-for="chip in filters"
        :key="chip.value"
        clickable
        :class="selectedFilter === chip.value ? 'chip-active' : 'chip-inactive'"
        @click="selectedFilter = chip.value"
      >
        <q-icon :name="statusIcon(chip.label)" :color="statusColor(chip.label)" class="q-mr-sm" />
        {{ chip.label }}
      </q-chip>
    </div>

    <q-page v-if="filteredTasks.length === 0" class="flex flex-center column fit">
      <div>No Task found</div>
    </q-page>
    <div class="row q-col-gutter-md q-mt-xs">
      <div class="col-12 col-md-6 col-lg-4" v-for="task in filteredTasks" :key="task.id">
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
import { ref, onValue, get } from 'firebase/database'
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

      selectedFilter: 'started',
      selectedMember: null,
      members: [],
      filters: [
        { label: 'Not Started', value: 'not started' },
        { label: 'Started', value: 'started' }, //Started, Resumed, Restarted
        { label: 'Blocked', value: 'blocked' },
        { label: 'Completed', value: 'completed' },
      ],
    }
  },

  computed: {
    taskStore() {
      return useTaskStore()
    },

    filteredTasks() {
      return useTaskStore().getTasks({
        type: this.selectedFilter,
        memberId: this.selectedMember,
      })
    },
  },
  created() {},
  async mounted() {
    this.fetchMembers()
    event.on('open-create-task', this.openCreate)
    useTaskStore().subscribe(this.communityId)
    this.getCurrentUser()
    this.selectedMember = getAuth().currentUser.uid
    this.tasks = this.taskStore.tasks
    this.filteredTasks = this.tasks
  },

  beforeUnmount() {
    event.off('open-create-task', this.openCreate)
    this.taskStore.unsubscribeListener()
  },

  methods: {
    statusIcon(status) {
      const map = {
        'Not Started': 'hourglass_empty',
        Started: 'play_arrow',
        Blocked: 'block',
        Completed: 'check_circle',
      }
      return map[status]
    },
    statusColor(status) {
      const map = {
        'Not Started': 'grey',
        Started: 'purple',
        Blocked: 'red',
        Completed: 'green',
      }
      return map[status]
    },
    async fetchMembers() {
      const membersSnap = await get(ref(db, `communityMembers/${this.$route.params.id}`))
      if (!membersSnap.exists()) {
        this.members = []
        return
      }

      const memberIds = Object.keys(membersSnap.val())

      // 3️⃣ Fetch only required users in parallel
      const memberPromises = memberIds.map(async (uid) => {
        const userSnap = await get(ref(db, `users/${uid}`))
        if (!userSnap.exists()) return null

        return {
          uid,
          ...userSnap.val(),
        }
      })

      // 4️⃣ Wait for all users to load
      const members = await Promise.all(memberPromises)

      // 5️⃣ Remove null values (if any user missing)
      this.members = members.filter((member) => member !== null)

      //Shift the current user at begining
      const currentUserId = getAuth().currentUser.uid
      const index = this.members.findIndex((m) => m.id === currentUserId)
      if (index > -1) {
        const [movedItem] = this.members.splice(index, 1) // splice returns an array of removed items
        this.members.unshift(movedItem)
      }

      this.members.unshift({ uid: 'all', name: 'All' })
    },

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

.chip-active {
  background: var(--q-primary);
  color: white;
}

.chip-inactive {
  background: rgba(25, 118, 210, 0.1); /* light primary */
  color: var(--q-primary);
}
</style>
