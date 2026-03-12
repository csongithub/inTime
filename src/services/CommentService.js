import { db, auth } from 'boot/firebase'
import { ref, push, set } from 'firebase/database'

export async function addComment(taskId, comment) {
  const commentRef = push(ref(db, 'taskComments/' + taskId))

  await set(commentRef, {
    comment: comment,
    createdBy: auth.currentUser.uid,
    createdAt: Date.now(),
  })
}
