<template>
  <q-page class="flex flex-center bg-white">
    <q-card class="signup-card q-pa-lg" :flat="isMobile">
      <!-- Header -->
      <div class="text-center q-mb-lg">
        <!-- <q-img
          src="../../assets/logo/intimelogo3.png"
          spinner-color="white"
          style="height: 140px; max-width: 150px"
        /> -->
        <q-img
          src="../../assets/logo/intimetext.png"
          spinner-color="white"
          style="height: 30px; max-width: 200px"
        />
        <div class="text-caption text-grey">Task - Track - Collaborate</div>
        <!-- <div class="text-h5 text-weight-bold text-primary">inTIME</div>
        <div class="text-caption text-grey">
          Join inTIME to manage and track your tasks in realtime
        </div> -->
      </div>

      <!-- Signup Form -->
      <q-form @submit.prevent="doSignup" class="q-gutter-md q-mt-sm">
        <!-- Name -->
        <q-input
          v-model="name"
          label="Full Name"
          outlined
          rounded
          dense
          lazy-rules
          :rules="[(val) => !!val || 'Name is required']"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <!-- Mobile -->
        <q-input
          v-model="mobile"
          label="Mobile Number"
          type="tel"
          outlined
          rounded
          dense
          lazy-rules
          :rules="mobileRules"
        >
          <template v-slot:prepend>
            <q-icon name="phone" />
          </template>
        </q-input>

        <!-- Password -->
        <q-input
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          outlined
          rounded
          dense
          lazy-rules
          :rules="passwordRules"
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

        <!-- Submit -->
        <q-btn
          label="Create Account"
          type="submit"
          color="primary"
          rounded
          unelevated
          class="full-width q-mt-sm"
          :loading="loading"
        />
      </q-form>

      <!-- Divider -->
      <div class="text-center q-my-md text-grey-6">─── OR ───</div>

      <!-- Back to Login -->
      <q-btn
        label="Back to Login"
        outline
        color="primary"
        rounded
        class="full-width"
        @click="openLogin"
      />
    </q-card>
  </q-page>
</template>

<script>
import { signup } from '../../services/AuthService'
import { Notify } from 'quasar'

export default {
  name: 'SignupPage',

  data() {
    return {
      name: '',
      mobile: '',
      password: '',
      showPassword: false,
      loading: false,
    }
  },

  computed: {
    isMobile() {
      return this.$q.screen.lt.md
    },
    mobileRules() {
      return [
        (val) => !!val || 'Mobile is required',
        (val) => /^[0-9]{10}$/.test(val) || 'Enter valid 10-digit mobile',
      ]
    },
    passwordRules() {
      return [
        (val) => !!val || 'Password is required',
        (val) => val.length >= 6 || 'Minimum 6 characters',
      ]
    },
  },

  methods: {
    async doSignup() {
      try {
        this.loading = true

        const val = await signup(this.name, this.mobile, this.password)

        if (val !== -1) {
          Notify.create({
            type: 'positive',
            message: 'Account created successfully',
          })

          this.$router.push('/')
        }
      } catch (err) {
        Notify.create({
          type: 'negative',
          message: err.message || 'Signup failed',
        })
      } finally {
        this.loading = false
      }
    },

    openLogin() {
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
.signup-card {
  width: 100%;
  max-width: 380px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}
</style>
