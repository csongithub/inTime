<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header elevated reveal class="bg-primary text-white q-pt-xl">
      <q-toolbar>
        <q-btn flat dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title>
          {{ communityName }}
        </q-toolbar-title>
        <q-btn
          v-if="$route.name === 'tasks'"
          label="New Task"
          no-caps
          flat
          class="glass-btn q-px-md q-ml-sm"
          @click="openCreateTask"
        />
      </q-toolbar>
    </q-header>

    <!-- Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Bottom Tabs -->
    <q-footer bordered :style="footerStyle">
      <q-tabs
        v-model="tab"
        dense
        align="justify"
        indicator-color="white"
        active-color="primary"
        class="text-grey-5 bg-grey-2"
      >
        <q-route-tab
          name="tasks"
          icon="task"
          label="Tasks"
          :to="`/community/${$route.params.id}/tasks`"
          exact
        />

        <q-route-tab
          name="users"
          icon="group"
          label="Members"
          :to="`/community/${$route.params.id}/users`"
          exact
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
import { getDatabase, ref, get } from 'firebase/database'
import event from 'src/utils/eventBus'
export default {
  name: 'CommunityLayout',

  data() {
    return {
      tab: 'tasks',
      communityName: '',
      bottomInset: 0,
    }
  },
  computed: {
    footerStyle() {
      let inset = this.bottomInset

      // ✅ Ignore fake/small insets (gesture mode)
      if (inset < 30) {
        inset = 0
      } else {
        // real nav bar → normalize
        inset = Math.min(inset, 60) - 8
      }

      return {
        paddingBottom: inset + 'px',
      }
    },
  },
  mounted() {
    this.fetchCommunity()

    // initial value
    this.bottomInset = window.androidBottomInset || 0

    // listen for updates
    document.addEventListener('android-inset-updated', () => {
      this.bottomInset = window.androidBottomInset || 0
    })
  },

  methods: {
    async fetchCommunity() {
      const db = getDatabase()
      const communityId = this.$route.params.id

      const snapshot = await get(ref(db, 'communities/' + communityId))
      if (snapshot.exists()) {
        this.communityName = snapshot.val().name
      }
    },

    goBack() {
      this.$router.push('/')
    },

    openCreateTask() {
      event.emit('open-create-task')
    },
  },
}
</script>

<style scoped></style>
