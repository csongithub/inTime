<template>
  <q-layout>
    <q-page-container>
      <q-page class="justify-center items-center">
        <Signup></Signup>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import Signup from 'src/pages/auth/SignupPage.vue'
export default {
  components: {
    Signup,
  },
  data() {
    return {}
  },
  methods: {},
}
</script>

<style>
.login-bg {
  background: linear-gradient(135deg, #1976d2, #42a5f5);
}
</style>
