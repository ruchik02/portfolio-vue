<template>
  <v-container>
    <h1 class="text-h4 mb-6">Notifications</h1>
    <v-card>
      <v-list>
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
          :title="notification.title"
          :subtitle="notification.message"
          :prepend-icon="notification.icon"
        >
          <template v-slot:append>
            <v-chip
              :color="notification.read ? 'grey' : 'primary'"
              size="small"
            >
              {{ notification.read ? 'Read' : 'New' }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'NotificationsView',
  data() {
    return {
      notifications: [
        {
          id: 1,
          title: 'New Project Comment',
          message: 'John Doe commented on your project',
          icon: 'mdi-comment',
          read: false
        },
        {
          id: 2,
          title: 'Project Update',
          message: 'Your project was successfully updated',
          icon: 'mdi-update',
          read: true
        }
      ]
    }
  }
}
</script> 