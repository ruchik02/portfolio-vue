<template>
  <v-container>
    <!-- Header Section -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4">Notifications</h1>
      <v-btn
        v-if="hasUnread"
        color="primary"
        variant="text"
        :loading="markingAllRead"
        @click="handleMarkAllRead"
      >
        Mark all as read
      </v-btn>
    </div>

    <!-- Loading State -->
    <v-skeleton-loader
      v-if="loading"
      type="list-item-three-line"
      :loading="loading"
      class="mb-2"
    ></v-skeleton-loader>

    <!-- Notifications List -->
    <v-card v-else>
      <v-list v-if="notifications.length" class="notification-list">
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
          :class="{ 'unread': !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <!-- Notification Icon -->
          <template v-slot:prepend>
            <v-avatar
              :color="getNotificationColor(notification.type)"
              size="40"
              class="mr-3"
            >
              <v-icon :icon="getNotificationIcon(notification.type)" color="white"></v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="text-subtitle-1 font-weight-medium mb-1">
            {{ notification.title }}
          </v-list-item-title>
          
          <v-list-item-subtitle class="text-body-2 mb-1">
            {{ notification.message }}
          </v-list-item-subtitle>

          <v-list-item-subtitle class="text-caption text-grey">
            {{ formatDate(notification.createdAt) }}
          </v-list-item-subtitle>

          <!-- Read/Unread Status -->
          <template v-slot:append>
            <div class="d-flex align-center">
              <v-chip
                :color="notification.read ? 'grey-lighten-1' : 'primary'"
                :variant="notification.read ? 'outlined' : 'elevated'"
                size="small"
                class="mr-2"
              >
                {{ notification.read ? 'Read' : 'New' }}
              </v-chip>
              <v-btn
                v-if="!notification.read"
                icon="mdi-check"
                size="small"
                variant="text"
                color="primary"
                @click.stop="markAsRead(notification.id)"
              >
                <v-tooltip activator="parent" location="top">
                  Mark as read
                </v-tooltip>
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>

      <!-- Empty State -->
      <v-card-text v-else class="text-center pa-8">
        <v-icon
          icon="mdi-bell-off-outline"
          size="64"
          color="grey-lighten-1"
          class="mb-4"
        ></v-icon>
        <h3 class="text-h6 text-grey-darken-1 mb-2">No notifications yet</h3>
        <p class="text-body-2 text-grey">
          When you receive notifications, they will appear here
        </p>
      </v-card-text>
    </v-card>

    <!-- Load More Button -->
    <div v-if="hasMore" class="text-center mt-4">
      <v-btn
        color="primary"
        variant="outlined"
        :loading="loadingMore"
        @click="loadMore"
      >
        Load More
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'NotificationsView',
  data() {
    return {
      markingAllRead: false,
      loadingMore: false,
      hasMore: false,
      page: 1
    }
  },
  computed: {
    ...mapState({
      loading: state => state.notifications.loading
    }),
    ...mapGetters({
      notifications: 'notifications/allNotifications'
    }),
    hasUnread() {
      return this.notifications.some(n => !n.read)
    }
  },
  methods: {
    ...mapActions({
      setupNotifications: 'notifications/setupNotificationsListener',
      markAsRead: 'notifications/markAsRead',
      markAllAsRead: 'notifications/markAllAsRead'
    }),
    getNotificationIcon(type) {
      const icons = {
        like: 'mdi-heart',
        comment: 'mdi-comment',
        follow: 'mdi-account-plus',
        mention: 'mdi-at',
        project_update: 'mdi-update',
        default: 'mdi-bell'
      }
      return icons[type] || icons.default
    },
    getNotificationColor(type) {
      const colors = {
        like: 'error',
        comment: 'primary',
        follow: 'success',
        mention: 'warning',
        project_update: 'info',
        default: 'grey'
      }
      return colors[type] || colors.default
    },
    formatDate(date) {
      if (!date) return ''
      
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (minutes < 60) return `${minutes} minutes ago`
      if (hours < 24) return `${hours} hours ago`
      if (days < 7) return `${days} days ago`
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    async handleNotificationClick(notification) {
      if (!notification.read) {
        await this.markAsRead(notification.id)
      }
      
      if (notification.link) {
        this.$router.push(notification.link)
      }
    },
    async handleMarkAllRead() {
      this.markingAllRead = true
      try {
        await this.markAllAsRead()
      } finally {
        this.markingAllRead = false
      }
    },
    async loadMore() {
      if (this.loadingMore) return
      
      this.loadingMore = true
      try {
        // Implement pagination logic here
        this.page += 1
        // Update hasMore based on whether there are more notifications to load
      } finally {
        this.loadingMore = false
      }
    }
  },
  async created() {
    await this.setupNotifications()
  }
}
</script>

<style scoped>
.notification-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.v-list-item {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.v-list-item:last-child {
  border-bottom: none;
}

.v-list-item:hover {
  background-color: rgb(var(--v-theme-surface-variant), 0.06);
}

.v-list-item.unread {
  background-color: rgb(var(--v-theme-primary), 0.05);
}

.v-list-item.unread:hover {
  background-color: rgb(var(--v-theme-primary), 0.08);
}

.v-avatar {
  transition: transform 0.2s ease;
}

.v-list-item:hover .v-avatar {
  transform: scale(1.05);
}

.v-chip {
  font-weight: 500;
}
</style> 