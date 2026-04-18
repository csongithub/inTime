<template>
  <q-page class="column full-height">
    <!-- HEADER -->
    <q-header elevated reveal class="bg-primary text-white q-pt-xl">
      <q-toolbar>
        <q-btn flat dense round icon="arrow_back" @click="goBack" />

        <q-toolbar-title> {{ taskId }} </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <!-- TASK CARD -->
    <div class="q-mt-sm">
      <TaskCard v-if="task" :task="task" />
    </div>

    <!-- IMAGE LIBRARY -->
    <div class="row items-center justify-between q-mb-xs">
      <div class="text-subtitle2 text-grey-8">Images ({{ images.length }})</div>
    </div>
    <div class="image-grid q-mt-xs">
      <div class="upload-tile" @click="!uploading && triggerFileInput()">
        <!-- 🔥 SHOW LOADER -->
        <div v-if="uploading" class="column items-center justify-center">
          <q-circular-progress
            indeterminate="false"
            :value="uploadProgress"
            size="40px"
            thickness="0.2"
            color="primary"
            track-color="grey-3"
          />

          <div class="text-caption q-mt-xs">{{ uploadProgress }}%</div>
        </div>

        <!-- 🔥 NORMAL STATE -->
        <div v-else>
          <q-icon name="image" size="28px" color="grey-6" />

          <q-icon name="add_circle" size="16px" color="primary" class="upload-plus" />
        </div>
      </div>

      <input type="file" ref="fileInput" hidden accept="image/*" @change="handleFileChange" />
      <input
        type="file"
        ref="cameraInput"
        hidden
        accept="image/*"
        capture="environment"
        @change="handleFileChange"
      />
      <!-- <input type="file" ref="fileInput" hidden accept="image/*" @change="handleFileChange" /> -->
      <!-- IMAGES -->

      <div v-for="(img, index) in images" :key="img.id" class="q-mr-sm">
        <q-img
          :src="img.url"
          style="width: 80px; height: 80px; border-radius: 8px"
          @click="openGallery(index, 'direct')"
        />
      </div>
    </div>

    <q-separator />

    <!-- COMMENTS LIST -->
    <div class="col scroll q-mt-xs">
      <div v-if="comments.length === 0" class="text-grey text-center q-mt-md">
        No discussion yet
      </div>

      <q-list v-else bordered separator>
        <q-item v-for="comment in comments" :key="comment.id" :id="`comment-${comment.id}`">
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
            <q-item-label v-if="comment.url" caption class="text-grey">
              <q-img
                :src="comment.url"
                style="width: 80px; height: 80px; border-radius: 8px"
                @click="openGallery(0, 'comment', comment.url)"
              />
            </q-item-label>
            <q-item-label caption class="q-mt-xs comment-text text-black">
              <span v-html="formatComment(comment.text)"></span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <q-separator />

    <!-- ADD COMMENT -->
    <div class="row q-pa-sm items-center q-gutter-sm">
      <div class="col relative-position">
        <div>
          <!-- ✅ IMAGE PREVIEW (ADD HERE) -->
          <div v-if="selectedCommentImage.url" class="q-mb-sm">
            <q-img
              :src="selectedCommentImage.url"
              style="width: 80px; height: 80px; border-radius: 8px"
            />
            <q-btn icon="close" size="sm" round dense color="negative" @click="clearCommentImage" />
          </div>
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
          >
            <template v-slot:append>
              <q-btn
                v-if="!selectedCommentImage.url"
                color="primary"
                flat
                round
                icon="image"
                @click="triggerCommentImage()"
              />
              <q-btn
                flat
                :disable="!newComment.trim()"
                icon="send"
                round
                color="primary"
                @click="addComment"
              />
            </template>
          </q-input>
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
      <!-- ✅ IMAGE BUTTON (ADD HERE) -->

      <!-- ✅ HIDDEN FILE INPUT -->
      <input
        type="file"
        ref="commentImage"
        hidden
        accept="image/*"
        @change="onCommentImageSelected"
      />

      <!-- <q-btn label="Test Ref" @click="testRef" /> -->
    </div>
    <q-dialog v-model="galleryOpen" maximized persistent>
      <div
        class="column full-height bg-black"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- 🔥 HEADER (LIKE YOUR APP HEADER) -->

        <!-- 🔥 IMAGE AREA -->
        <div class="col">
          <q-carousel v-model="currentIndex" swipeable animated infinite class="full-height">
            <!-- <q-carousel-slide v-for="(img, i) in images" :name="i" :key="img.id">
              <div class="full-height flex flex-center">
                <q-img :src="img.url" fit="contain" style="max-height: 100%; max-width: 100%" />
              </div>
            </q-carousel-slide> -->
            <q-carousel-slide v-for="(img, i) in currentImages" :name="i" :key="i">
              <div class="full-height flex flex-center relative-position">
                <!-- IMAGE -->
                <q-img :src="img.url" fit="contain" style="max-height: 100%; max-width: 100%" />

                <!-- 🔥 LEFT BUTTON -->
                <!-- <q-btn
                  v-if="images.length > 1"
                  round
                  dense
                  icon="chevron_left"
                  class="nav-btn left-btn"
                  @click.stop="prevImage"
                /> -->

                <!-- 🔥 RIGHT BUTTON -->
                <!-- <q-btn
                  flat
                  v-if="images.length > 1"
                  round
                  dense
                  icon="chevron_right"
                  class="nav-btn right-btn"
                  @click.stop="nextImage"
                /> -->
              </div>
            </q-carousel-slide>
          </q-carousel>
        </div>
        <q-footer class="text-white">
          <q-toolbar class="relative-position">
            <!-- 🔹 LEFT: BACK -->
            <q-btn flat label="close" dense @click="galleryOpen = false" />

            <!-- 🔹 CENTER: COUNT -->
            <div class="absolute-center text-white text-subtitle2">
              {{ currentIndex + 1 }} / {{ currentImages.length }}
            </div>

            <!-- 🔹 RIGHT: SHARE -->
            <div class="absolute-right q-pr-sm">
              <q-btn flat round icon="share" @click="shareImage" />
            </div>
          </q-toolbar>
        </q-footer>
      </div>
    </q-dialog>
    <q-dialog v-model="uploadSheet" position="bottom" @hide="onSheetClose">
      <q-card class="upload-sheet">
        <!-- TITLE -->
        <div class="text-subtitle1 text-center q-pa-md text-grey-8">Upload Image</div>

        <q-separator />

        <!-- CAMERA -->
        <q-item clickable v-ripple @click="selectUploadOption('camera')">
          <q-avatar color="grey-2" text-color="primary" size="40px">
            <q-icon name="photo_camera" />
          </q-avatar>
          <q-item-section>Open Camera</q-item-section>
        </q-item>

        <!-- GALLERY -->
        <q-item clickable v-ripple @click="selectUploadOption('gallery')">
          <q-avatar color="grey-2" text-color="primary" size="40px">
            <q-icon name="image" />
          </q-avatar>
          <q-item-section>Choose Image</q-item-section>
        </q-item>

        <q-separator />

        <!-- CANCEL -->
        <q-item clickable v-ripple @click="uploadSheet = false">
          <q-item-section class="text-center text-negative"> Cancel </q-item-section>
        </q-item>
      </q-card>
    </q-dialog>

    <!-- {{ JSON.stringify(communityMembers) }} -->
  </q-page>
</template>

<script>
import TaskCard from 'src/components/task/TaskCard.vue'
import { db } from 'src/boot/firebase'
import { ref as dbRef, update, onValue, get, push, set, onChildAdded } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { notifyMention, notifyComment } from 'src/helpers/NotificationHelpers'
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
} from 'firebase/storage'

export default {
  name: 'TaskDiscussionPage',

  components: {
    TaskCard,
  },
  watch: {
    comments() {
      this.scrollToComment()
    },
  },
  computed: {},
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
      //Files/Image related data below
      images: [],
      currentImages: [],
      uploading: false,
      uploadProgress: 0,
      selectedCommentImage: { file: null, url: null },
      //FULLSCREEN GALLERY WITH SWIPE 🔥
      galleryOpen: false,
      currentIndex: 0,

      touchStartY: 0,
      touchEndY: 0,
      uploadSheet: false,
    }
  },

  mounted() {
    this.taskId = this.$route.params.taskId
    this.communityId = this.$route.params.communityId
    this.loadImages() //Load task images
    this.loadTask()
    this.loadComments()
    this.getCurrentUser()
    this.fetchMembers()
    this.scrollToComment()
    // 🔥 Only call if opened via notification (in browser notification )
    if (this.$route.query.uid && this.$route.query.notificationId) {
      this.markNotificationAsRead(this.$route.query.uid, this.$route.query.notificationId)
    }
  },

  methods: {
    selectUploadOption(type) {
      this.uploadSheet = false

      if (type === 'camera') {
        this.$refs.cameraInput?.click()
      } else {
        this.$refs.fileInput?.click()
      }
    },
    // openUploadOptions() {
    //   this.$q
    //     .bottomSheet({
    //       // message: 'Upload Image',
    //       // color: 'primary',
    //       actions: [
    //         {
    //           label: 'Open Camera',
    //           icon: 'photo_camera',
    //           id: 'camera',
    //           color: 'primary',
    //         },
    //         {
    //           label: 'Choose Image',
    //           icon: 'image',
    //           id: 'gallery',
    //           color: 'primary',
    //         },
    //       ],
    //     })
    //     .onOk((action) => {
    //       if (action.id === 'camera') {
    //         this.openCamera()
    //       } else {
    //         this.openGalleryUpload()
    //       }
    //     })
    // },
    // openCamera() {
    //   this.$refs.cameraInput?.click()
    // },

    // openGalleryUpload() {
    //   this.$refs.fileInput?.click()
    // },
    testRef() {
      console.log('REF:', this.$refs.commentImage)
    },
    prevImage() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      } else {
        this.currentIndex = this.images.length - 1 // loop
      }
    },

    nextImage() {
      if (this.currentIndex < this.images.length - 1) {
        this.currentIndex++
      } else {
        this.currentIndex = 0 // loop
      }
    },
    // async shareImage() {
    //   try {
    //     const img = this.images[this.currentIndex]
    //     if (!img) return

    //     const response = await fetch(img.url)
    //     const blob = await response.blob()

    //     const file = new File([blob], 'image.jpg', { type: blob.type })

    //     if (navigator.canShare && navigator.canShare({ files: [file] })) {
    //       await navigator.share({
    //         files: [file],
    //         title: 'Task Image',
    //       })
    //     } else {
    //       // fallback
    //       await navigator.clipboard.writeText(img.url)
    //       this.$q.notify({
    //         message: 'Image link copied',
    //         color: 'positive',
    //       })
    //     }
    //   } catch (err) {
    //     console.error('❌ Share failed:', err)
    //   }
    // },
    async shareImage() {
      try {
        const img = this.images[this.currentIndex]
        if (!img) return

        // 🔥 Try native share with URL (works everywhere)
        if (navigator.share) {
          await navigator.share({
            title: 'Task Image',
            text: 'Check this image',
            url: img.url,
          })
          return
        }

        // fallback
        await navigator.clipboard.writeText(img.url)
        this.$q.notify({
          message: 'Image link copied',
          color: 'positive',
        })
      } catch (err) {
        console.error('❌ Share failed:', err)
      }
    },
    onTouchStart(e) {
      this.touchStartY = e.touches[0].clientY
    },

    onTouchMove(e) {
      this.touchEndY = e.touches[0].clientY
    },

    onTouchEnd() {
      const diffY = this.touchEndY - this.touchStartY

      // 🔥 Only close if strong vertical swipe
      if (diffY > 120) {
        this.galleryOpen = false
      }

      this.touchStartY = 0
      this.touchEndY = 0
    },

    openGallery(index, origin, url = null) {
      if (origin === 'direct') {
        this.currentImages = this.images
      } else if (origin === 'comment') {
        const img = { url: url }
        this.currentImages = []
        this.currentImages.push(img)
      }
      this.currentIndex = index
      this.galleryOpen = true
    },
    async deleteImage(image) {
      try {
        const storage = getStorage()

        // delete from storage
        const fileRef = storageRef(storage, image.path)
        await deleteObject(fileRef)

        // delete from DB
        await set(dbRef(db, `taskImages/${this.communityId}/${this.taskId}/${image.id}`), null)
      } catch (err) {
        console.error('❌ Delete failed:', err)
      }
    },
    triggerCommentImage() {
      // console.log(JSON.stringify(this.$refs.commentImage))
      this.$refs.commentImage.click()
    },
    onCommentImageSelected(e) {
      // console.log('COMMENT FILE: ' + JSON.stringify(e))
      const file = e.target.files[0]
      if (file) {
        this.selectedCommentImage.file = file
        this.selectedCommentImage.url = URL.createObjectURL(file)
      }
    },
    clearCommentImage() {
      this.selectedCommentImage.file = null
      this.selectedCommentImage.url = null
    },
    triggerFileInput() {
      this.uploadSheet = true
    },

    handleFileChange(e) {
      // console.log('FILE: ' + JSON.stringify(e))
      const file = e.target.files[0]
      // console.log('SELECTED  FILE: ' + JSON.stringify(file.name))
      if (file) {
        this.uploadImage(file, 'DIRECT')
      }
    },
    loadImages() {
      const imagesRef = dbRef(db, `taskImages/${this.communityId}/${this.taskId}`)

      onChildAdded(imagesRef, (snapshot) => {
        const img = {
          id: snapshot.key,
          ...snapshot.val(),
        }

        // this.images.push(img)
        this.images.unshift(img)
      })
    },
    // async uploadImage(file, source = 'DIRECT', commentId = null) {
    //   if (!file) return
    //   let fileURL = null
    //   this.uploading = true
    //   this.uploadProgress = 0

    //   try {
    //     const storage = getStorage()

    //     const imagesRef = dbRef(db, `taskImages/${this.communityId}/${this.taskId}`)
    //     const newImageRef = push(imagesRef)
    //     const imageId = newImageRef.key

    //     const filePath = `task-images/${this.communityId}/${this.taskId}/${imageId}_${file.name}`
    //     const fileRef = storageRef(storage, filePath)

    //     // 🔥 USE resumable upload
    //     const uploadTask = uploadBytesResumable(fileRef, file)

    //     uploadTask.on(
    //       'state_changed',
    //       (snapshot) => {
    //         const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100

    //         this.uploadProgress = Math.round(progress)
    //       },
    //       (error) => {
    //         console.error('❌ Upload error:', error)
    //         this.uploading = false
    //       },
    //       async () => {
    //         const url = await getDownloadURL(uploadTask.snapshot.ref)
    //         fileURL = url
    //         await set(newImageRef, {
    //           url,
    //           path: filePath,
    //           uploadedBy: this.currentUser.id,
    //           uploadedByName: this.currentUser.name,
    //           createdAt: Date.now(),
    //           source,
    //           commentId: commentId || null,
    //         })

    //         this.uploading = false
    //         this.uploadProgress = 0
    //       },
    //     )
    //   } catch (err) {
    //     console.error('❌ Upload failed:', err)
    //     this.uploading = false
    //   }
    //   return fileURL
    // },
    async uploadImage(file, source = 'DIRECT', commentId = null) {
      if (!file) return null

      this.uploading = true
      this.uploadProgress = 0

      try {
        const storage = getStorage()

        const imagesRef = dbRef(db, `taskImages/${this.communityId}/${this.taskId}`)
        const newImageRef = push(imagesRef)
        const imageId = newImageRef.key

        const filePath = `task-images/${this.communityId}/${this.taskId}/${imageId}_${file.name}`
        const fileRef = storageRef(storage, filePath)

        const uploadTask = uploadBytesResumable(fileRef, file)

        // 🔥 Wrap in Promise
        const fileURL = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              this.uploadProgress = Math.round(progress)
            },
            (error) => {
              console.error('❌ Upload error:', error)
              this.uploading = false
              reject(error)
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref)

                await set(newImageRef, {
                  url,
                  path: filePath,
                  uploadedBy: this.currentUser.id,
                  uploadedByName: this.currentUser.name,
                  createdAt: Date.now(),
                  source,
                  commentId: commentId || null,
                })

                this.uploading = false
                this.uploadProgress = 0

                resolve(url) // ✅ return URL here
              } catch (err) {
                reject(err)
              }
            },
          )
        })

        return fileURL
      } catch (err) {
        console.error('❌ Upload failed:', err)
        this.uploading = false
        return null
      }
    },
    async markNotificationAsRead(uid, notificationId) {
      try {
        await update(dbRef(db, `notifications/${uid}/${notificationId}`), { read: true })
        console.log('🔔 Marked as read')
      } catch (err) {
        console.error('❌ Failed to mark notification as read:', err)
      }
    },
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
          console.log('User not found')
        }
      })
    },
    goBack() {
      // this.$router.push(`/community/${this.communityId}/tasks`)
      this.$router.back()
    },

    async loadTask() {
      try {
        const taskRef = dbRef(db, `tasks/${this.communityId}/${this.taskId}`)
        onValue(taskRef, async (snapshot) => {
          if (snapshot.exists()) {
            this.task = {
              id: this.taskId,

              ...snapshot.val(),
              discussion: true,
            }
            const user = (await get(dbRef(db, `users/${this.task.assigneeId}`))).val()
            this.task['assigneeName'] = user.name
            // console.log('Task Details' + JSON.stringify(this.task))
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
    extractMentions(text) {
      // const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const regex = /@\[(.*?)\|(.*?)\]/g
      const ids = []

      let match
      while ((match = regex.exec(text))) {
        ids.push(match[1])
      }

      return ids
    },
    async addComment() {
      if (!this.newComment.trim()) return
      const file = this.selectedCommentImage.file // set selected image

      const communityId = this.$route.params.communityId
      const taskId = this.$route.params.taskId

      try {
        const textForStorage = this.convertMentions(this.newComment)
        // Save comment to Firebase
        const commentsRef = dbRef(db, `taskComments/${communityId}/${taskId}`)
        const newCommentRef = push(commentsRef)

        // 🔥 Upload image if exists
        let fileUrl = null
        if (file) {
          fileUrl = await this.uploadImage(file, 'COMMENT', newCommentRef.key)
          this.selectedCommentImage.url = null
          this.selectedCommentImage.file = null
        }

        const comment = {
          text: textForStorage,
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          createdAt: Date.now(),
          mentions: this.mentions,
          url: fileUrl,
        }

        Object.keys(this.mentionMap).forEach((name) => {
          if (!this.newComment.includes(name)) {
            delete this.mentionMap[name]
          }
        })

        await set(newCommentRef, comment)
        this.newComment = ''

        //Send Notification
        const mentionedUserIds = this.extractMentions(textForStorage)
        this.notifyMentionedMembers(mentionedUserIds, newCommentRef.key)
        this.notifyAllMembers(newCommentRef.key)
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
    async notifyMentionedMembers(mentionedUserIds, commentId) {
      if (mentionedUserIds.length > 0)
        await notifyMention({
          userIds: mentionedUserIds,
          taskId: this.taskId,
          communityId: this.communityId,
          fromUser: this.currentUser,
          commentId: commentId,
        })
    },
    async notifyAllMembers(commentId) {
      // 2️⃣ Get member IDs
      const membersSnap = await get(dbRef(db, `communityMembers/${this.communityId}`))
      if (!membersSnap.exists()) {
        return
      }
      const memberIds = Object.keys(membersSnap.val())
      const members = memberIds.filter((memberId) => memberId !== this.currentUser.id)

      await notifyComment({
        userIds: members,
        taskId: this.taskId,
        communityId: this.communityId,
        fromUser: this.currentUser,
        commentId: commentId,
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
    scrollToComment(retry = 0) {
      const commentId = this.$route.query.commentId
      if (!commentId) return

      this.$nextTick(() => {
        const el = document.getElementById(`comment-${commentId}`)
        const container = document.querySelector('.your-scroll-container')

        // console.log('Looking for:', `comment-${commentId}`)
        // console.log('Element:', document.getElementById(`comment-${commentId}`))
        if (el && container) {
          container.scrollTop = el.offsetTop - 100
        }
        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })

          // highlight
          el.style.background = '#e3f2fd'
          setTimeout(() => (el.style.background = ''), 2000)
        } else if (retry < 10) {
          // ⏳ retry until comments load
          setTimeout(() => {
            this.scrollToComment(retry + 1)
          }, 300)
        }
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
.image-grid {
  max-height: 180px; /* 🔥 3 rows approx */
  overflow-y: auto;
}

/* optional: hide scrollbar */
.image-grid::-webkit-scrollbar {
  display: none;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* ✅ exactly 4 items per row */
  gap: 8px;

  max-height: 180px; /* for 2 rows */
  overflow-y: auto;
}
.gallery-container {
  background: o;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.gallery-header {
  height: 50px;
  padding: 0 10px;
  z-index: 10;
}

.gallery-carousel {
  flex: 1;
}

.upload-tile {
  width: 80px;
  height: 80px;
  border: 3px dashed #5482de;
  border-radius: 8px;
  background: #f5f5f5;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
  cursor: pointer;
}

.upload-tile.loading {
  opacity: 0.7;
}

.upload-tile:hover {
  background: #e0e0e0;
}

.upload-plus {
  position: absolute;
  bottom: 4px;
  right: 4px;
}

.image-thumb {
  width: 100px;
  height: 100px;
  border-radius: 8px;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  color: white;
}

.left-btn {
  left: 10px;
}

.right-btn {
  right: 10px;
}
.upload-sheet {
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding-bottom: 10px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}
</style>
