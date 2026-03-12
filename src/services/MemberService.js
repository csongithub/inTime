import { db } from 'boot/firebase'
import { ref, get, set } from 'firebase/database'

export async function addMember(communityId, mobile) {
  const usersSnap = await get(ref(db, 'users'))

  let uid = null

  usersSnap.forEach((x) => {
    if (x.val().mobile == mobile) {
      uid = x.key
    }
  })

  if (uid) {
    await set(ref(db, 'communityMembers/' + communityId + '/' + uid), true)
  }
}
