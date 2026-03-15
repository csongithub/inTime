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
        name: 'tasks',
        component: () => import('pages/community/TasksPage.vue'),
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('pages/community/UsersPage.vue'),
      },
      {
        path: '/community/:communityId/task/:taskId/discussion',
        name: 'task-discussion',
        component: () => import('pages/community/TaskDiscussionPage.vue'),
      },
    ],
  },
]

export default routes
