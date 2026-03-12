import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import { auth } from 'boot/firebase'
import routes from './routes'

export default route(function () {
  const Router = createRouter({
    history: createWebHistory(),
    routes,
  })

  Router.beforeEach((to, from, next) => {
    auth.onAuthStateChanged((user) => {
      if (to.meta.requiresAuth && !user) {
        next('/')
      } else if ((to.path == '/' || to.path == '/signup') && user) {
        next('/home')
      } else {
        next()
      }
    })
  })

  return Router
})
