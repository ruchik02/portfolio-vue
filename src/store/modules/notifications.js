import { db } from '@/firebase/config';
import auth from './auth';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, Timestamp, limit, startAfter, getDocs } from 'firebase/firestore'

export default {
  namespaced: true,
  state: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    lastVisible: null,
    hasMore: true
  },
  getters: {
    unreadNotifications: (state) => state.unreadCount,
    allNotifications: (state) => state.notifications.sort((a, b) => b.createdAt - a.createdAt),
    isLoading: (state) => state.loading
  },
  mutations: {
    SET_NOTIFICATIONS(state, notifications) {
      state.notifications = notifications;
    },
    SET_UNREAD_COUNT(state, count) {
      state.unreadCount = count;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    MARK_AS_READ(state, notificationId) {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    APPEND_NOTIFICATIONS(state, notifications) {
      state.notifications = [...state.notifications, ...notifications];
    },
    SET_LAST_VISIBLE(state, lastVisible) {
      state.lastVisible = lastVisible;
    },
    SET_HAS_MORE(state, hasMore) {
      state.hasMore = hasMore;
    }
  },
  actions: {
    async setupNotificationsListener({ commit }) {
      const user = auth.currentUser;
      if (!user) return;

      commit('SET_LOADING', true);

      try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const notifications = [];
          snapshot.forEach((doc) => {
            notifications.push({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate()
            });
          });
          
          commit('SET_NOTIFICATIONS', notifications);
          commit('SET_LAST_VISIBLE', snapshot.docs[snapshot.docs.length - 1]);
          commit('SET_HAS_MORE', snapshot.docs.length === 10);
          
          const unreadCount = notifications.filter(n => !n.read).length;
          commit('SET_UNREAD_COUNT', unreadCount);
        });

        return unsubscribe;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async loadMore({ commit, state }) {
      if (!state.hasMore || !state.lastVisible) return;

      const user = auth.currentUser;
      if (!user) return;

      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        startAfter(state.lastVisible),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const notifications = [];
      
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        });
      });

      commit('APPEND_NOTIFICATIONS', notifications);
      commit('SET_LAST_VISIBLE', snapshot.docs[snapshot.docs.length - 1]);
      commit('SET_HAS_MORE', snapshot.docs.length === 10);
    },

    async markAsRead({ commit }, notificationId) {
      try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
          read: true,
          readAt: Timestamp.now()
        });
        commit('MARK_AS_READ', notificationId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    },

    async markAllAsRead({ state, dispatch }) {
      try {
        const unreadNotifications = state.notifications.filter(n => !n.read);
        await Promise.all(
          unreadNotifications.map(n => dispatch('markAsRead', n.id))
        );
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    }
  }
}; 