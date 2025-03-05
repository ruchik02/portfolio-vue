export default {
  namespaced: true,
  state: {
    notifications: [],
    unreadCount: 0
  },
  getters: {
    unreadNotifications: (state) => state.unreadCount,
    allNotifications: (state) => state.notifications
  },
  mutations: {
    SET_NOTIFICATIONS(state, notifications) {
      state.notifications = notifications;
    },
    SET_UNREAD_COUNT(state, count) {
      state.unreadCount = count;
    },
    MARK_AS_READ(state, notificationId) {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    }
  },
  actions: {
    async fetchNotifications({ commit }) {
      try {
        // Replace with your actual API call
        const notifications = []; // Fetch from your API
        commit('SET_NOTIFICATIONS', notifications);
        const unreadCount = notifications.filter(n => !n.read).length;
        commit('SET_UNREAD_COUNT', unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    },
    async markAsRead({ commit }, notificationId) {
      try {
        // Replace with your actual API call
        await Promise.resolve(); // Your API call here
        commit('MARK_AS_READ', notificationId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  }
}; 