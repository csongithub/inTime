<template>
  <q-layout>
    <q-page-container>
      <q-page class="justify-center items-center">
        <Login></Login>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import Login from 'src/pages/auth/LoginPage.vue'
export default {
  components: {
    Login,
  },
  data() {
    return {}
  },
  methods: {},
}
</script>

<style>
.login-bg {
  background: linear-gradient(135deg, #ffffff, #42a5f5);
}
</style>
