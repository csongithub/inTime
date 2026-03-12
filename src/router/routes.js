const routes = [
  {
    name: 'login',
    path: '/',
    component: () => import('layouts/LoginLayout.vue'),
  },
  {
    name: 'signup',
    path: '/signup',
    component: () => import('layouts/SignupLayout.vue'),
  },
  {
    name: 'home',
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'communities',
        path: '',
        component: () => import('src/pages/Communities.vue'),
        meta: {
          breadcrumbs: [{ label: 'Home', routName: 'home' }],
        },
      },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/community/:id',
    component: () => import('layouts/CommunityLayout.vue'),
    props: true,
    children: [
      {
        path: '',
        redirect: (to) => {
          return { path: `/community/${to.params.id}/tasks` }
        },
      },
      {
        path: 'tasks',
        component: () => import('pages/community/TasksPage.vue'),
      },
      {
        path: 'users',
        component: () => import('pages/community/UsersPage.vue'),
      },
      {
        path: 'new',
        component: () => import('components/task/NewTask.vue'),
      },
    ],
  },
]

export default routes
