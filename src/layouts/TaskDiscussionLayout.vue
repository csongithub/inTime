<template>
  <q-layout view="hHh lpR fFf">
    <!-- HEADER -->
    <q-header elevated reveal class="bg-primary text-white q-pt-xl">
      <q-toolbar>
        <q-btn flat dense round icon="arrow_back" @click="goBack" />

        <q-toolbar-title> {{ taskId }} </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <!-- Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'TaskDiscussionLayout',

  components: {},
  watch: {},
  computed: {},
  data() {
    return {}
  },

  mounted() {},

  methods: {
    goBack() {
      this.$router.back()
    },
  },
}
</script>

<style scoped>
.q-page {
  background: #fafafa;
}
</style>
