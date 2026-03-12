<template>
  <q-page padding>
    <!-- Search User -->
    <q-input
      filled
      v-model="mobileSearch"
      label="Search by Mobile"
      type="number"
      @keyup.enter="searchUser"
    >
      <template v-slot:append>
        <q-btn icon="search" flat @click="searchUser" />
      </template>
    </q-input>

    <!-- Search Result -->
    <div v-if="searchedUser" class="q-mt-md">
      <q-card class="q-pa-sm">
        <q-card-section class="row items-center no-wrap">
          <!-- User Info -->
          <div class="col">
            <div class="text-weight-medium">
              {{ searchedUser.name }}
            </div>
            <div class="text-caption text-grey">
              {{ searchedUser.mobile }}
            </div>
          </div>

          <!-- Add Button -->
          <q-btn size="sm" label="Add" color="primary" unelevated @click="addUser" />
        </q-card-section>
      </q-card>
    </div>
    <!-- Send Invite for not registerd users -->
    <div v-if="mobileNotRegistered" class="q-mt-md">
      <q-card class="q-pa-md rounded-borders shadow-2">
        <q-card-section class="row items-start no-wrap">
          <!-- Icon -->
          <q-avatar color="orange" text-color="white" icon="person_off" class="q-mr-md" />

          <!-- Text -->
          <div class="col">
            <div class="text-weight-medium text-body1">User not found</div>

            <div class="text-caption text-grey-7 q-mt-xs">
              <span class="text-bold text-blue">{{ mobileSearch }} </span> is not on
              <span class="text-weight-medium">inTIME</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Action Buttons -->
        <q-card-actions align="right" class="q-pt-sm">
          <q-btn flat dense label="Discard" color="grey-7" @click="discardInvite" />

          <q-btn
            unelevated
            dense
            label="Invite"
            color="primary"
            class="q-ml-sm"
            @click="sendInvite"
          />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Members List -->
    <div class="q-mt-lg">
      <q-list bordered separator>
        <q-item v-for="user in members" :key="user.uid">
          <q-item-section avatar>
            <q-avatar :color="getColor(user.name)" text-color="white">
              {{ user.name.charAt(0) }}
            </q-avatar>
          </q-item-section>
          <!-- Name + Badges -->
          <q-item-section>
            <!-- Name -->
            <div class="text-weight-medium">
              {{ user.name }}
            </div>

            <!-- Badges Row -->
            <div class="row items-center q-gutter-sm q-mt-xs">
              <q-badge v-if="user.creator" color="green" label="Creator" />

              <q-badge v-if="user.currentUser" color="primary" label="You" />
            </div>
          </q-item-section>
          <q-item-section> {{ user.mobile }} </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
import { getDatabase, ref, get, set } from 'firebase/database'
import { auth } from 'boot/firebase'
import { getAvatarColor } from 'src/services/CommonUtils'

export default {
  name: 'UsersPage',
  setup() {
    return {
      db: getDatabase(),
    }
  },
  data() {
    return {
      mobileSearch: '',
      searchedUser: null,
      members: [],
      mobileNotRegistered: false,
    }
  },
  mounted() {
    this.fetchMembers()
  },

  methods: {
    discardInvite() {
      this.mobileNotRegistered = false
    },
    sendInvite() {
      this.mobileNotRegistered = false
    },
    getColor(name) {
      return getAvatarColor(name)
    },
    async searchUser() {
      if (!this.mobileSearch) return

      // 1️⃣ Get userId directly
      const indexSnap = await get(ref(this.db, `mobileIndex/${this.mobileSearch}`))
      if (!indexSnap.exists()) {
        this.mobileNotRegistered = true
        return
      }
      const userId = indexSnap.val()

      //Avoid adding current user
      if (userId === auth.currentUser.uid) {
        this.$q.notify({
          type: 'negative',
          message: 'Hey, this is you, already a member of this community',
        })
        return
      }
      // Avoid adding existing user
      const existing = await get(
        ref(this.db, `communityMembers/${this.$route.params.id}/${userId}`),
      )
      if (existing.exists()) {
        this.$q.notify({
          type: 'negative',
          message: 'User already present',
        })
        return
      }

      // 2️⃣ Get user data
      const userSnap = await get(ref(this.db, `users/${userId}`))
      this.searchedUser = {
        uid: userId,
        ...userSnap.val(),
      }
    },

    async addUser() {
      // const db = getDatabase()
      const communityId = this.$route.params.id

      await set(ref(this.db, `communityMembers/${communityId}/${this.searchedUser.uid}`), true)

      this.$q.notify({
        type: 'positive',
        message: 'User added successfully',
      })

      this.searchedUser = null
      this.mobileSearch = ''
      this.fetchMembers()
    },

    async fetchMembers() {
      const db = getDatabase()
      const communityId = this.$route.params.id

      // 1️⃣ Get creator id properly
      const createdBySnap = await get(ref(db, `communities/${communityId}/createdBy`))
      const createdById = createdBySnap.exists() ? createdBySnap.val() : null

      // 2️⃣ Get member IDs
      const membersSnap = await get(ref(db, `communityMembers/${communityId}`))
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
          creator: uid === createdById,
          currentUser: uid === auth.currentUser.uid,
        }
      })

      // 4️⃣ Wait for all users to load
      const members = await Promise.all(memberPromises)

      // 5️⃣ Remove null values (if any user missing)
      this.members = members.filter((member) => member !== null)
    },
  },
}
</script>
