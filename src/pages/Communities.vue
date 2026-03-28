<template>
  <q-page v-if="communities.length === 0" class="flex flex-center column fit">
    <div>No Community found</div>
    <div>Please create one, or ask someone to add you</div>
  </q-page>
  <q-page v-else class="column fit scroll">
    <!-- Sticky Header -->
    <div class="sticky-search">
      <q-card flat class="q-pa-sm">
        <div class="row q-col-gutter-sm items-center">
          <div class="col">
            <q-input
              dense
              outlined
              v-model="search"
              placeholder="Search communities..."
              debounce="300"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="col-auto">
            <q-select
              dense
              outlined
              v-model="sortOption"
              :options="sortOptions"
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card>
    </div>

    <!-- Scrollable List -->
    <div class="col">
      <q-list bordered separator>
        <q-item
          v-for="community in filteredCommunities"
          :key="community.id"
          clickable
          v-ripple
          @click="openCommunity(community.id)"
        >
          <q-item-section avatar>
            <q-avatar :color="getColor(community.name)" text-color="white">
              {{ community.name.charAt(0) }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ community.name }}</q-item-label>
            <q-item-label caption>
              {{ community.lastTask }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-badge color="red" v-if="community.unreadCount > 0">
              {{ community.unreadCount }}
            </q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
  <!-- <q-page-sticky :offset="[18, 18]">
    <q-btn size="md" position="bottom-right" round color="primary" icon="add" @click="openDialog" />
  </q-page-sticky> -->
</template>

<script>
// import { onMounted, ref } from 'vue'
import { db, auth } from 'boot/firebase'
import { ref as dbRef, get } from 'firebase/database'
import { createCommunity } from '../services/CommunityService'
import { getAvatarColor } from 'src/services/CommonUtils'
import event from 'src/utils/eventBus'
export default {
  name: 'IndexPage',
  mixins: [],
  setup() {
    return {}
  },
  components: {},
  created() {},
  async mounted() {
    event.on('open-create-community', this.openDialog)
    await this.loadCommunities()
  },
  beforeUnmount() {
    event.off('open-create-community', this.openDialog)
  },
  computed: {
    filteredCommunities() {
      let list = [...this.communities]

      // 🔎 Filter
      if (this.search) {
        list = list.filter((c) => c.name.toLowerCase().includes(this.search.toLowerCase()))
      }

      // 🔃 Sort
      switch (this.sortOption) {
        case 'name_asc':
          list.sort((a, b) => a.name.localeCompare(b.name))
          break

        case 'name_desc':
          list.sort((a, b) => b.name.localeCompare(a.name))
          break

        case 'default':
          list.sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0))
          break
      }

      return list
    },
  },
  data() {
    return {
      communityIds: [],
      communities: [],
      search: '',
      sortOption: 'default',
      sortOptions: [
        { label: 'Deafult', value: 'default' },
        { label: 'Name (A-Z)', value: 'name_asc' },
        { label: 'Name (Z-A)', value: 'name_desc' },
      ],
    }
  },

  methods: {
    async loadCommunities() {
      this.communityIds = []
      this.communities = []

      const snapshot = await get(dbRef(db, 'communityMembers'))
      if (!snapshot.exists()) {
        this.communities = []
        return
      }

      const data = snapshot.val()

      // Step 1: Find community IDs where user exists
      Object.keys(data).forEach((communityId) => {
        if (data[communityId][auth.currentUser.uid]) {
          this.communityIds.push(communityId)
        }
      })

      // Step 2: Fetch community details

      for (let id of this.communityIds) {
        const communitySnap = await get(dbRef(db, `communities/${id}`))
        if (communitySnap.exists()) {
          this.communities.push({ id, ...communitySnap.val() })
        }
      }
    },
    openDialog() {
      this.$q
        .dialog({
          message: 'New Community:',
          prompt: {
            model: '',
            type: 'text', // optional
          },
          cancel: true,
          persistent: true,
        })
        .onOk((data) => {
          this.createCommunity(data)
        })
    },
    async createCommunity(name) {
      if (name === null || name === '') return
      const community = await createCommunity(name)
      this.communities.push(community)
    },
    getColor(name) {
      return getAvatarColor(name)
    },
    openCommunity(id) {
      this.$router.push(`/community/${id}`)
    },
  },
}
</script>

<style scoped>
.sticky-search {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 1000;
  background: white;
}
</style>
