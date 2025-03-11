<template>
  <v-navigation-drawer
    v-model="drawer"
  >
    <v-list density="compact" nav>
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :to="item.path"
        :value="item.path"
        :prepend-icon="item.icon"
        :title="item.title"
        rounded="lg"
      ></v-list-item>
    </v-list>

    <template v-slot:append>
      <v-divider class="mb-2"></v-divider>
      
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-cog"
          title="Settings"
          to="/settings"
          rounded="lg"
        ></v-list-item>
        
        <!-- Theme Toggle -->
        <v-list-item
          @click="toggleTheme"
          :prepend-icon="theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          :title="theme.global.current.value.dark ? 'Light Mode' : 'Dark Mode'"
          rounded="lg"
        ></v-list-item>

        <!-- Logout -->
        <v-list-item
          prepend-icon="mdi-logout"
          title="Logout"
          @click="handleLogout"
          rounded="lg"
        ></v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { useTheme } from 'vuetify'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'NavigationDrawer',
  setup() {
    const theme = useTheme()
    return { theme }
  },
  data() {
    return {
      drawer: true,
      rail: false,
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
          title: 'Create Project',
          path: '/create',
          icon: 'mdi-plus-circle'
        },
        {
          title: 'Explore',
          path: '/explore',
          icon: 'mdi-compass'
        },
        {
          title: 'Profile',
          path: '/profile',
          icon: 'mdi-account'
        },
        {
          title: 'Notifications',
          path: '/notifications',
          icon: 'mdi-bell'
        },
        {
          title: 'Bookmarks',
          path: '/bookmarks',
          icon: 'mdi-bookmark'
        },
        // {
        //   title: 'Analytics',
        //   path: '/analytics',
        //   icon: 'mdi-chart-bar'
        // },
        {
          title: 'Help & Support',
          path: '/support',
          icon: 'mdi-help-circle'
        }
      ]
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/currentUser'
    }),
    defaultAvatar() {
      return new URL('@/assets/profile-user.png', import.meta.url).href
    }
  },
  methods: {
    ...mapActions({
      logout: 'auth/logout'
    }),
    toggleTheme() {
      this.theme.global.name.value = 
      this.theme.global.current.value.dark ? 'light' : 'dark'
    },
    async handleLogout() {
      try {
        await this.logout()
        this.$router.push('/auth')
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
  }
}
</script>

<style scoped>
.v-list-item--active {
  background: rgb(var(--v-theme-primary));
  color: white;
}

.v-list-item--active:hover {
  background: rgb(var(--v-theme-primary));
}

/* Add divider between main and secondary navigation */
.v-list :deep(.v-list-item:nth-child(5)) {
  margin-bottom: 8px;
  padding-bottom: 8px;
}
</style> 