<template>
  <v-app>
    <!-- Show loading state while auth initializes -->
    <div v-if="authLoading" class="d-flex justify-center align-center fill-height">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
    </div>
    
    <template v-else>
      <!-- App Bar - Only show when authenticated and not on auth page -->
      <v-app-bar
        v-if="isAuthenticated && !isAuthPage"
        elevation="1"
        class="px-3"
      >
        <v-app-bar-nav-icon
          @click="drawer = !drawer"
        ></v-app-bar-nav-icon>

        <v-app-bar-title class="font-weight-bold">
          CreativeHub
        </v-app-bar-title>

        <v-spacer></v-spacer>

        <!-- Notifications -->
        <v-btn
          icon
          class="mr-2"
          variant="text"
        >
          <v-badge
            :content="unreadNotifications"
            :value="unreadNotifications"
            color="error"
            dot
            location="top end"
            offset-x="3"
            offset-y="3"
          >
            <v-icon size="24">mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>

        <!-- Create New Project -->
        <v-btn
          icon
          class="mr-2"
          to="/create"
          title="Create New Project"
        >
          <v-icon>mdi-plus-circle-outline</v-icon>
        </v-btn>

        <!-- Search -->
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search projects..."
          single-line
          hide-details
          density="comfortable"
          class="search-field mx-2"
          variant="outlined"
          @update:model-value="handleSearch"
        ></v-text-field>

        <!-- Theme Toggle -->
        <v-btn
          icon
          @click="toggleTheme"
          class="ml-2"
        >
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>

        <!-- User Menu -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              class="ml-2"
              v-bind="props"
            >
              <v-avatar color="primary" size="32">
                <v-img
                  :src="currentUser?.photoURL || defaultAvatar"
                  alt="User"
                ></v-img>
              </v-avatar>
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              to="/profile"
              prepend-icon="mdi-account"
            >
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>

            <v-list-item
              to="/settings"
              prepend-icon="mdi-cog"
            >
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item>
            
            <v-list-item
              @click="logout"
              prepend-icon="mdi-logout"
              color="error"
            >
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>

      <!-- Navigation Drawer -->
      <navigation-drawer 
        v-if="isAuthenticated && !isAuthPage"
        v-model="drawer"
      />

      <!-- Main Content -->
      <v-main>
        <router-view></router-view>
      </v-main>

      <!-- Global Snackbar -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
        location="bottom"
      >
        {{ snackbar.text }}

        <template v-slot:actions>
          <v-btn
            color="white"
            variant="text"
            @click="snackbar.show = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </template>
  </v-app>
</template>

<script>
import { useTheme } from 'vuetify'
import { mapGetters, mapActions } from 'vuex'
import NavigationDrawer from '@/components/NavigationDrawer.vue'

export default {
  name: 'App',
  components: {
    NavigationDrawer
  },
  setup() {
    const theme = useTheme()
    return { theme }
  },
  data() {
    return {
      drawer: false,
      authReady: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success',
        timeout: 3000
      },
      menuItems: [
        {
          title: 'Dashboard',
          path: '/dashboard',
          icon: 'mdi-view-dashboard'
        },
        {
          title: 'My Projects',
          path: '/projects',
          icon: 'mdi-folder'
        },
        {
          title: 'Explore',
          path: '/explore',
          icon: 'mdi-compass'
        },
        {
          title: 'Create Project',
          path: '/create',
          icon: 'mdi-plus-circle'
        },
        {
          title: 'Settings',
          path: '/settings',
          icon: 'mdi-cog'
        }
      ],
      search: ''
    }
  },
  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated',
      currentUser: 'auth/currentUser',
      authLoading: 'auth/loading',
      isDark: 'theme/isDark',
      unreadNotifications: 'notifications/unreadNotifications'
    }),
    isAuthPage() {
      return this.$route.path === '/auth'
    },
    defaultAvatar() {
      return new URL('@/assets/profile-user.png', import.meta.url).href
    }
  },
  methods: {
    ...mapActions({
      logout: 'auth/logout',
      initAuth: 'auth/init'
    }),
    toggleTheme() {
      this.theme.global.name.value = 
        this.theme.global.current.value.dark ? 'light' : 'dark'
    },
    async handleLogout() {
      try {
        this.drawer = false // Close drawer before logout
        await this.logout()
        // Use replace instead of push
        await this.$router.replace('/auth')
        this.showSnackbar('Logged out successfully', 'success')
      } catch (error) {
        console.error('Logout error:', error)
        this.showSnackbar(error.message || 'Logout failed', 'error')
      }
    },
    showSnackbar(text, color = 'success') {
      this.snackbar.text = text
      this.snackbar.color = color
      this.snackbar.show = true
    },
    toggleDrawer() {
      this.drawer = !this.drawer
    },
    handleSearch() {
      // Implement search functionality
      console.log('Searching for:', this.search)
    }
  },
  async created() {
    try {
      // Wait for auth to initialize
      await this.initAuth()
      this.authReady = true

      // Handle initial route based on auth state
      const requiresAuth = this.$route.matched.some(record => record.meta.requiresAuth)
      const requiresGuest = this.$route.matched.some(record => record.meta.requiresGuest)

      if (!this.isAuthenticated && requiresAuth) {
        await this.$router.replace('/auth')
      } else if (this.isAuthenticated && requiresGuest) {
        await this.$router.replace('/dashboard')
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    }

    // Initialize notifications
    this.$store.dispatch('notifications/fetchNotifications');
    
    // Initialize theme from localStorage if available
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.$store.dispatch('theme/setTheme', savedTheme === 'dark');
    }
  },
  watch: {
    // Watch for auth state changes after initial load
    async isAuthenticated(newValue) {
      if (!this.authLoading && this.authReady) {
        const currentRoute = this.$route
        const requiresAuth = currentRoute.matched.some(record => record.meta.requiresAuth)
        const requiresGuest = currentRoute.matched.some(record => record.meta.requiresGuest)

        if (!newValue && requiresAuth) {
          await this.$router.replace('/auth')
        } else if (newValue && requiresGuest) {
          await this.$router.replace('/dashboard')
        }
      }
    }
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.v-navigation-drawer {
  padding: 12px;
}

.v-list-item {
  margin-bottom: 4px;
}

.v-list-item--active {
  background: rgb(var(--v-theme-primary));
  color: white;
}

.search-field {
  max-width: 500px;
  min-width: 320px;
  flex-grow: 1;
  margin: 0 24px;
}

@media (max-width: 960px) {
  .search-field {
    max-width: 320px;
    min-width: 200px;
  }
}

@media (max-width: 600px) {
  .search-field {
    display: none;
  }
}

.v-badge__badge {
  min-width: 8px !important;
  min-height: 8px !important;
  height: 8px !important;
  width: 8px !important;
  padding: 0 !important;
}
</style>