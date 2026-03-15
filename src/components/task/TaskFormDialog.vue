<template>
  <q-dialog
    v-model="dialogModel"
    transition-show="slide-up"
    transition-hide="slide-down"
    :maximized="$q.screen.lt.md"
    persistent
    @hide="clearForm"
  >
    <q-layout view="hHh lpR fFf" container class="bg-white">
      <!-- Header -->
      <q-header elevated reveal class="bg-primary text-white q-pt-lg">
        <q-toolbar>
          <q-btn flat dense icon="arrow_back" @click="dialogModel = false" />
          <q-toolbar-title> Create Task </q-toolbar-title>
        </q-toolbar>
      </q-header>
      <q-page-container>
        <q-page class="q-pa-md">
          <q-card class="dialog-card full-height column">
            <!-- <q-card-section class="q-pt-lg row items-center justify-between bg-primary text-white">
        <q-btn flat dense icon="arrow_back" @click="dialogModel = false" />
        <div class="text-h6">
          {{ editMode ? 'Update: ' + form.id : 'Task' }}
        </div>
      </q-card-section> -->
            <!-- Dialog Header -->
            <!-- <q-toolbar class="bg-primary text-white">
        <q-btn flat dense icon="arrow_back" @click="dialogModel = false" />
        <q-toolbar-title>Create Task</q-toolbar-title>
      </q-toolbar> -->
            <!-- <q-separator /> -->

            <q-card-section class="scroll form-section">
              <q-input v-model="form.title" label="Task Title" outlined dense class="q-mb-md" />

              <q-input
                v-model="form.description"
                label="Description"
                type="textarea"
                outlined
                autogrow
                class="q-mb-md"
              />

              <q-select
                v-model="form.priority"
                :options="priorities"
                label="Priority"
                outlined
                dense
                class="q-mb-md"
              />

              <!-- <q-select
          v-model="form.status"
          :options="statuses"
          label="Status"
          outlined
          dense
          class="q-mb-md"
        /> -->

              <q-input
                v-model.number="form.anticipatedDays"
                type="number"
                label="Anticipated Days"
                outlined
                dense
                class="q-mb-md"
              />

              <q-select
                v-model="form.assigneeId"
                :options="filteredMembers"
                option-label="name"
                option-value="uid"
                label="Assign"
                emit-value
                map-options
                use-input
                input-debounce="0"
                @filter="filterMembers"
                clearable
                dense
                @update:model-value="setAssignedById"
                :behavior="$q.screen.lt.md ? 'dialog' : ''"
              />

              <q-btn
                v-if="currentUserId !== form.assigneeId"
                flat
                size="md"
                color="primary"
                icon="person"
                label="Assign To Me"
                @click="assignToMe"
                class="text-capitalize"
              />
              <div class="q-mt-md" v-if="editMode">
                <div class="text-subtitle2">Progress: {{ form.progress }}%</div>

                <q-slider
                  v-model="form.progress"
                  :min="0"
                  :max="100"
                  label
                  label-always
                  class="q-mt-sm"
                />
              </div>
            </q-card-section>

            <q-separator />
            <q-btn class="q-ma-md" color="primary" label="Create" @click="saveTask" />
            <!-- <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Cancel" @click="dialogModel = false" />
              <q-btn color="primary" label="Create" @click="saveTask" />
            </q-card-actions> -->
          </q-card>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script>
import { ref as dbRef, get } from 'firebase/database'
import { db, auth } from 'boot/firebase'

export default {
  props: {
    modelValue: Boolean,
    editTask: Object,
  },

  emits: ['update:modelValue', 'save'],

  data() {
    return {
      form: this.getEmptyForm(),
      priorities: ['Low', 'Medium', 'High', 'On Fire'],
      statuses: ['New', 'Assigned', 'Started', 'Blocked', 'Completed'],

      members: [], // ✅ add this
      filteredMembers: [],
      currentUserId: auth.currentUser.uid,
    }
  },

  computed: {
    dialogModel: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      },
    },

    editMode() {
      return !!this.editTask
    },
  },

  watch: {
    editTask: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form = { ...val }
          this.assignedById = this.form.assignedById || null
        } else {
          this.form = this.getEmptyForm()
        }
      },
    },
    async modelValue(val) {
      if (val) {
        this.loadMembers()
      }
    },
  },

  methods: {
    getEmptyForm() {
      return {
        title: '',
        description: '',
        priority: 'Low',
        // status: 'New',
        anticipatedDays: 1,
        progress: 0,
        assigneeId: null,
        assignedById: null,
      }
    },
    setAssignedById() {
      this.form.assignedById = this.form.assigneeId !== null ? auth.currentUser.uid : null
    },
    async assignToMe() {
      const currentUserId = auth.currentUser.uid

      this.form.assigneeId = currentUserId
      // Ensure user exists in filteredMembers
      const exists = this.filteredMembers.some((m) => m.uid === currentUserId)

      if (!exists) {
        const snapshot = await get(dbRef(db, `users/${currentUserId}`))

        const user = snapshot.val()

        this.filteredMembers.push({
          uid: currentUserId,
          name: user.name,
        })
      }
    },
    async loadMembers() {
      const communityId = this.$route.params.id
      const snap = await get(dbRef(db, `communityMembers/${communityId}`))
      const membersObj = snap.val() || {}

      const memberIds = Object.keys(membersObj)

      // Clear old data
      this.members = []

      // Fetch only required users
      // const currentUserId = auth.currentUser.uid
      for (const uid of memberIds) {
        //avoid adding current user
        // if (uid === currentUserId) continue
        const userSnap = await get(dbRef(db, `users/${uid}`))
        const user = userSnap.val()

        if (user) {
          this.members.push({
            uid,
            name: user.name,
          })
        }
      }
    },
    filterMembers(val, update) {
      update(() => {
        if (val === '') {
          this.filteredMembers = this.members
        } else {
          const needle = val.toLowerCase()
          this.filteredMembers = this.members.filter((m) => m.name.toLowerCase().includes(needle))
        }
      })
    },

    saveTask() {
      this.$emit('save', this.form)
      this.dialogModel = false
    },
    clearForm() {
      this.form = this.getEmptyForm()
    },
  },
}
</script>

<style scoped>
.dialog-card {
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
}

.form-section {
  max-height: 65vh;
  overflow-y: auto;
}
</style>
