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
    <!-- <q-footer :style="footerStyle" class="bg-primary"> </q-footer> -->
  </q-layout>
</template>

<script>
export default {
  name: 'TaskDiscussionLayout',

  components: {},
  watch: {},
  computed: {
    footerStyle() {
      let inset = this.bottomInset

      // ✅ Ignore fake/small insets (gesture mode)
      if (inset < 30) {
        inset = 0
      } else {
        // real nav bar → normalize
        inset = Math.min(inset, 60) - 8
      }

      return {
        paddingBottom: inset + 'px',
      }
    },
  },
  data() {
    return {
      bottomInset: 0,
    }
  },

  mounted() {
    // initial value
    this.bottomInset = window.androidBottomInset || 0

    // listen for updates
    document.addEventListener('android-inset-updated', () => {
      this.bottomInset = window.androidBottomInset || 0
    })
  },

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
