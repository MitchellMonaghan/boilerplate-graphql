
const routes = [
  {
    path: '/',
    component: () => import('layouts/public.vue'),
    children: [
      // Anonymous only
      { path: '', component: () => import('pages/Index.vue'), meta: { anonymousOnly: true } },
      { name: 'login', path: '/login', component: () => import(`pages/auth/login`), meta: { anonymousOnly: true } },
      { name: 'register', path: '/register', component: () => import(`pages/auth/register`), meta: { anonymousOnly: true } }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/authenticated.vue'),
    children: [
      // Authentication required
      { name: 'authenticatedLandingPage', path: '/auth', component: () => import(`pages/Index.vue`), meta: { requiresAuthentication: true } },
      { name: 'authenticatedLandingPage', path: '/auth2', component: () => import(`pages/Index.vue`), meta: { requiresAuthentication: true } }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes