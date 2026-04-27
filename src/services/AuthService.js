import { auth, db } from 'boot/firebase'
import { ref, set, get } from 'firebase/database'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { Notify } from 'quasar'

export async function signup(name, mobile, password) {
  const fakeEmail = mobile + '@intime.com'

  if (await checkMobileExists(mobile)) {
    Notify.create({
      type: 'negative',
      message: 'Mobile number already registered.',
    })
    return -1
  }
  var res = null
  try {
    res = await createUserWithEmailAndPassword(auth, fakeEmail, password)
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      Notify.create({
        type: 'negative',
        message: 'Mobile/Email number already registered.',
      })
      return -1
    }
  }
  // const res = await createUserWithEmailAndPassword(auth, fakeEmail, password)
  // 1️⃣ Save user
  await set(ref(db, 'users/' + res.user.uid), {
    name: name,
    mobile: mobile,
  })

  // 2️⃣ Create mobile index
  await set(ref(db, `mobileIndex/${mobile}`), res.user.uid)

  return res.user
}

async function checkMobileExists(mobile) {
  const snapshot = await get(ref(db, `mobileIndex/${mobile}`))
  return snapshot.exists()
}

export async function login(mobile, password) {
  const fakeEmail = mobile + '@intime.com'
  const res = await signInWithEmailAndPassword(auth, fakeEmail, password)
  return res.user
}

export async function logout() {
  await signOut(auth)
}
