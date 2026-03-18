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

            <!-- <q-item-label caption class="q-mt-xs comment-text">
              {{ comment.text }}
            </q-item-label> -->
            <q-item-label caption class="q-mt-xs comment-text text-black">
              <span v-html="formatComment(comment.text)"></span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <q-separator />

    <!-- ADD COMMENT -->
    <!-- ADD COMMENT -->
    <div class="row q-pa-sm items-center q-gutter-sm">
      <div class="col relative-position">
        <div>
          <q-input
            class="mention-input"
            ref="commentInput"
            v-model="newComment"
            dense
            autogrow
            type="textarea"
            placeholder="Write a comment..."
            @update:model-value="handleInput"
            @keyup="updateCaretPosition"
            @keydown="handleKeyDown"
          />
        </div>

        <!-- MENTION DROPDOWN -->
        <div
          v-if="showMentionMenu"
          class="mention-dropdown shadow-4"
          :style="{
            top: dropdownY + 'px',
            left: dropdownX + 'px',
          }"
        >
          <q-list dense>
            <q-item
              v-for="(user, index) in mentionList"
              :key="user.id"
              clickable
              :active="index === selectedMentionIndex"
              active-class="mention-active"
              @click="insertMention(user)"
            >
              <q-item-section>
                {{ user.name }}
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>

      <q-btn :disable="!newComment.trim()" icon="send" round color="primary" @click="addComment" />
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
  watch: {},

  data() {
    return {
      task: null,
      taskId: null,
      communityId: null,
      comments: [],
      currentUser: {
        id: 'user123',
        name: 'Chandan',
      },
      newComment: '',
      showMentionMenu: false,
      mentionQuery: '',
      mentionList: [],
      mentions: {},
      mentionMap: {},
      communityMembers: [],

      dropdownX: 0,
      dropdownY: 0,

      selectedMentionIndex: 0,
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
    },
    updateCaretPosition(e) {
      const textarea = e.target
      textarea.getBoundingClientRect()

      this.dropdownX = textarea.offsetLeft + 10
      this.dropdownY = textarea.offsetTop + textarea.offsetHeight - 10
    },

    handleInput(val) {
      const match = val.match(/(?:^|\s)@(\w+)$/)

      if (match) {
        this.mentionQuery = match[1].toLowerCase()
        this.showMentionMenu = true
        this.filterUsers()
      } else {
        this.showMentionMenu = false
      }
    },
    filterUsers() {
      this.mentionList = this.communityMembers
        .filter((user) => user.name.toLowerCase().includes(this.mentionQuery))
        .slice(0, 5)
    },
    insertMention(user) {
      this.newComment = this.newComment.replace(/@(\w+)$/, `@${user.name} `)

      this.mentions[user.uid] = true
      this.mentionMap[user.name] = user.uid
      this.showMentionMenu = false
      this.selectedMentionIndex = 0
    },
    convertMentions(text) {
      Object.keys(this.mentionMap).forEach((name) => {
        const uid = this.mentionMap[name]

        const regex = new RegExp(`@${name}`, 'g')

        text = text.replace(regex, `@[${uid}|${name}]`)
      })

      return text
    },
    handleKeyDown(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        this.selectedMentionIndex = (this.selectedMentionIndex + 1) % this.mentionList.length
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        this.selectedMentionIndex =
          (this.selectedMentionIndex - 1 + this.mentionList.length) % this.mentionList.length
        return
      }

      if (e.key === 'Enter' && this.showMentionMenu) {
        e.preventDefault()
        const user = this.mentionList[this.selectedMentionIndex]
        if (user) this.insertMention(user)
        return
      }

      // Normal comment submission
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.addComment()
      }
    },
    formatComment(text) {
      const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')

      return escaped.replace(/@\[(.*?)\|(.*?)\]/g, '<span class="mention">@$2</span>')
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
        const textForStorage = this.convertMentions(this.newComment)
        // Save comment to Firebase
        const commentsRef = dbRef(db, `taskComments/${communityId}/${taskId}`)
        const newCommentRef = push(commentsRef)

        const comment = {
          text: textForStorage,
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          createdAt: Date.now(),
          mentions: this.mentions,
        }

        Object.keys(this.mentionMap).forEach((name) => {
          if (!this.newComment.includes(name)) {
            delete this.mentionMap[name]
          }
        })

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

.comment-text :deep(.mention) {
  background: rgba(25, 118, 210, 0.1);
  color: #18a722;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: pre-line;
}

.mention-dropdown {
  position: absolute;
  z-index: 5000;
  background: white;
  border-radius: 8px;
  min-width: 220px;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
}
.mention-active {
  background: rgba(66, 176, 44, 0.1);
}
</style>
