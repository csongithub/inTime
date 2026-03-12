import { db, auth } from 'boot/firebase'
import { ref, push, set } from 'firebase/database'
import { getPrefixFromName } from './CommonUtils'

export async function createCommunity(name) {
  const communityRef = push(ref(db, 'communities'))

  const community = {
    name: name,
    createdBy: auth.currentUser.uid,
    createdAt: Date.now(),
    imageUrl: 'null',
    taskCounter: 100,
    taskPrefix: getPrefixFromName(name),
  }

  await set(communityRef, community)

  await set(ref(db, 'communityMembers/' + communityRef.key + '/' + auth.currentUser.uid), true)
  return {
    id: communityRef.key,
    name: community.name,
    createdBy: community.createdBy,
    createdAt: community.createdAt,
    imageUrl: community.imageUrl,
  }
}
