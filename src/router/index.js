import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from 'vuex'
import store from '@/store'
import DashboardView from '@/views/DashboardView.vue'
import AuthView from '@/views/AuthView.vue'
import NotificationsView from '@/views/NotificationsView.vue'
import BookmarksView from '@/views/BookmarksView.vue'
import AnalyticsView from '@/views/AnalyticsView.vue'
import SupportView from '@/views/SupportView.vue'
import ProfileView from '../views/ProfileView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/project/:id',
    name: 'ProjectDetails',
    component: () => import('@/views/ProjectDetailsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/project/:id/edit',
    name: 'EditProject',
    component: () => import('@/views/EditProjectView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create',
    name: 'CreateProject',
    component: () => import('@/views/CreateProjectView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/explore',
    name: 'Explore',
    component: () => import('@/views/ExploreView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: NotificationsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: BookmarksView,
    meta: { requiresAuth: true }
  },
  // {
  //   path: '/analytics',
  //   name: 'analytics',
  //   component: AnalyticsView,
  //   meta: { requiresAuth: true }
  // },
  {
    path: '/support',
    name: 'support',
    component: SupportView,
    meta: { requiresAuth: true }
  },
  {
    path: '/support/getting-started',
    name: 'getting-started',
    component: () => import('@/views/support/GettingStartedView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/support/faq',
    name: 'faq',
    component: () => import('@/views/support/FAQView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/support/contact',
    name: 'contact',
    component: () => import('@/views/support/ContactView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  // Wait for auth to initialize if needed
  if (store.state.auth.loading) {
    await store.dispatch('auth/init')
  }

  const isAuthenticated = store.getters['auth/isAuthenticated']

  // Handle navigation based on auth state
  if (requiresAuth && !isAuthenticated) {
    next({ 
      path: '/auth',
      replace: true
    })
  } else if (requiresGuest && isAuthenticated) {
    next({ 
      path: '/dashboard',
      replace: true
    })
  } else {
    next()
  }
})

export default router 