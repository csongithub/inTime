<template>
  <q-page class="column full-height">
    <!-- HEADER -->
    <q-header elevated reveal class="bg-primary text-white q-pt-lg">
      <q-toolbar>
        <q-btn flat dense round icon="arrow_back" @click="goBack" />

        <q-toolbar-title> {{ taskId }} </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <div class="q-mt-sm">
      <TaskCard v-if="task" :task="task" />
    </div>

    <!-- TASK CARD -->

    <q-separator />

    <!-- COMMENTS LIST -->
    <div class="col scroll q-mt-xs">
      <div v-if="comments.length === 0" class="text-grey text-center q-mt-md">
        No discussion yet
      </div>

      <q-list v-else bordered separator>
        <q-item v-for="comment in comments" :key="comment.id">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              {{ comment.userName.charAt(0) }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold">
              {{ comment.userName }}
            </q-item-label>

            <q-item-label caption class="text-grey">
              {{ formatDate(comment.createdAt) }}
            </q-item-label>

            <q-item-label caption class="q-mt-xs comment-text">
              {{ comment.text }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <q-separator />

    <!-- ADD COMMENT -->
    <div class="row q-pa-sm items-center q-gutter-sm">
      <q-input
        v-model="newComment"
        filled
        dense
        autogrow
        class="col"
        placeholder="Write a comment..."
        @keyup.enter.exact="addComment"
      />

      <q-btn :disable="!newComment.trim()" icon="send" round color="primary" @click="addComment" />
      <q-list v-if="showMentionList" bordered class="mention-list">
        <q-item v-for="user in communityMembers" :key="user.id" clickable @click="selectUser(user)">
          <q-item-section>
            {{ user.name }}
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <!-- {{ JSON.stringify(communityMembers) }} -->
  </q-page>
</template>

<script>
import TaskCard from 'src/components/task/TaskCard.vue'
import { db } from 'src/boot/firebase'
import { ref as dbRef, onValue, get, push, set, onChildAdded } from 'firebase/database'
import { getAuth } from 'firebase/auth'

export default {
  name: 'TaskDiscussionPage',

  components: {
    TaskCard,
  },
  watch: {
    newComment(val) {
      const lastWord = val.split(' ').pop()

      if (lastWord.startsWith('@')) {
        this.showMentionList = true
      } else {
        this.showMentionList = false
      }
    },
  },

  data() {
    return {
      task: null,
      taskId: null,
      communityId: null,
      comments: [],
      newComment: '',
      currentUser: {
        id: 'user123',
        name: 'Chandan',
      },
      communityMembers: [],
      showMentionList: false,
    }
  },

  mounted() {
    this.taskId = this.$route.params.taskId
    this.communityId = this.$route.params.communityId
    this.loadTask()
    this.loadComments()
    this.getCurrentUser()
    this.fetchMembers()
  },

  methods: {
    async fetchMembers() {
      // 1 Get member IDs
      const membersSnap = await get(dbRef(db, `communityMembers/${this.communityId}`))
      if (!membersSnap.exists()) {
        this.communityMembers = []
        return
      }

      const memberIds = Object.keys(membersSnap.val())

      //Fetch only required users in parallel
      const memberPromises = memberIds.map(async (uid) => {
        const userSnap = await get(dbRef(db, `users/${uid}`))
        if (!userSnap.exists()) return null

        return {
          uid,
          ...userSnap.val(),
        }
      })

      // 4️⃣ Wait for all users to load
      const members = await Promise.all(memberPromises)

      // 5️⃣ Remove null values (if any user missing)
      this.communityMembers = members.filter((member) => member !== null)

      // const membersRef = dbRef(db, `communityMembers/${this.communityId}`)

      // onValue(membersRef, (snapshot) => {
      //   const data = snapshot.val() || {}

      //   this.communityMembers = Object.keys(data).map((uid) => ({
      //     id: uid,
      //     name: data[uid].name,
      //   }))
      // })
    },
    selectUser(user) {
      const words = this.newComment.split(' ')
      words.pop()

      this.newComment = words.join(' ') + ' @' + user.name + ' '

      this.showMentionList = false
    },
    getCurrentUser() {
      const auth = getAuth()
      const user = auth.currentUser

      const userRef = dbRef(db, `users/${user.uid}`)
      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          this.currentUser = {
            id: user.uid,
            ...snapshot.val(),
          }
        } else {
          console.log('Task not found')
        }
      })
    },
    goBack() {
      this.$router.back()
    },

    async loadTask() {
      try {
        const taskRef = dbRef(db, `tasks/${this.communityId}/${this.taskId}`)

        onValue(taskRef, (snapshot) => {
          if (snapshot.exists()) {
            this.task = {
              id: this.taskId,
              ...snapshot.val(),
            }
          } else {
            console.log('Task not found')
          }
        })
      } catch (err) {
        console.error('Error loading task:', err)
      }
    },

    loadComments() {
      const commentsRef = dbRef(db, `taskComments/${this.communityId}/${this.taskId}`)

      onChildAdded(commentsRef, (snapshot) => {
        const comment = {
          id: snapshot.key,
          ...snapshot.val(),
        }

        this.comments.push(comment)
      })
    },

    async addComment() {
      if (!this.newComment.trim()) return

      const communityId = this.$route.params.communityId
      const taskId = this.$route.params.taskId

      try {
        const comment = {
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          text: this.newComment,
          createdAt: Date.now(),
        }
        // TODO: Save comment to Firebase
        const commentsRef = dbRef(db, `taskComments/${communityId}/${taskId}`)
        const newCommentRef = push(commentsRef)

        await set(newCommentRef, comment)
        this.newComment = ''
      } catch (err) {
        console.error('Error saving comment:', err)
      }

      this.$nextTick(() => {
        const container = this.$el.querySelector('.scroll')
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },

    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
  },
}
</script>

<style scoped>
.q-page {
  background: #fafafa;
}

.comment-text {
  white-space: pre-line;
}
</style>
