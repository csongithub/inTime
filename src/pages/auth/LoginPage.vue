<template>
  <q-page class="flex flex-center bg-primary">
    <q-card class="login-card q-pa-lg q-ma-sm">
      <!-- App Logo / Title -->
      <div class="text-center q-mb-lg">
        <div class="text-h5 text-weight-bold text-primary">inTIME</div>
        <div class="text-caption text-grey">Track your tasks efficiently</div>
      </div>

      <!-- Login Form -->
      <q-form @submit.prevent="login" class="q-gutter-md">
        <q-input
          v-model="mobile"
          label="Mobile Number"
          outlined
          rounded
          dense
          type="tel"
          lazy-rules
          :rules="[(val) => !!val || 'Mobile is required']"
        >
          <template v-slot:prepend>
            <q-icon name="phone" />
          </template>
        </q-input>

        <q-input
          v-model="password"
          label="Password"
          outlined
          rounded
          dense
          :type="showPassword ? 'text' : 'password'"
          lazy-rules
          :rules="[(val) => !!val || 'Password is required']"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>

          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <!-- Login Button -->
        <q-btn
          label="Login"
          type="submit"
          color="primary"
          unelevated
          rounded
          class="full-width q-mt-sm"
          :loading="loading"
        />
      </q-form>

      <!-- Divider -->
      <div class="text-center q-my-md text-grey-6">─── OR ───</div>

      <!-- Signup Button -->
      <q-btn
        label="Create New Account"
        outline
        color="primary"
        rounded
        class="full-width"
        @click="doSignup"
      />
    </q-card>
  </q-page>
</template>

<script>
import { login } from '../../services/AuthService'
import { db, auth } from 'boot/firebase'
import { ref as dbRef, get } from 'firebase/database'
import { useUserStore } from 'src/stores/user'
import { Notify } from 'quasar'

const userStore = useUserStore()

export default {
  name: 'LoginPage',
  data() {
    return {
      mobile: '',
      password: '',
      showPassword: false,
      loading: false,
    }
  },

  methods: {
    async login() {
      try {
        this.loading = true

        await login(this.mobile, this.password)

        const uid = auth.currentUser.uid
        const snapshot = await get(dbRef(db, `users/${uid}`))

        if (snapshot.exists()) {
          const user = snapshot.val()
          userStore.setUser({
            uid,
            name: user.name,
            mobile: user.mobile,
          })
        }

        this.$router.push('/home')
      } catch (err) {
        Notify.create({
          type: 'negative',
          message: err.message || 'Login failed',
        })
      } finally {
        this.loading = false
      }
    },

    doSignup() {
      this.$router.push('/signup')
    },
  },
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 380px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}
</style>
