import { db } from '@/firebase/config'
import auth from './auth'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore'

export default {
  namespaced: true,
  state: {
    bookmarks: [],
    loading: false
  },
  getters: {
    allBookmarks: state => state.bookmarks,
    isBookmarked: state => projectId => 
      state.bookmarks.some(bookmark => bookmark.projectId === projectId)
  },
  mutations: {
    SET_BOOKMARKS(state, bookmarks) {
      state.bookmarks = bookmarks
    },
    ADD_BOOKMARK(state, bookmark) {
      state.bookmarks.unshift(bookmark)
    },
    REMOVE_BOOKMARK(state, bookmarkId) {
      state.bookmarks = state.bookmarks.filter(b => b.id !== bookmarkId)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },
  actions: {
    async fetchBookmarks({ commit }) {
      if (!auth.currentUser) return

      commit('SET_LOADING', true)
      try {
        const bookmarksRef = collection(db, 'bookmarks')
        const q = query(
          bookmarksRef,
          where('userId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        )
        
        const snapshot = await getDocs(q)
        const bookmarks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }))
        
        commit('SET_BOOKMARKS', bookmarks)
      } catch (error) {
        console.error('Error fetching bookmarks:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async addBookmark({ commit }, project) {
      if (!auth.currentUser) return

      try {
        const bookmarkData = {
          userId: auth.currentUser.uid,
          projectId: project.id,
          title: project.title,
          description: project.description,
          thumbnail: project.thumbnail,
          creatorName: project.creator?.name,
          creatorId: project.userId,
          createdAt: Timestamp.now()
        }

        const docRef = await addDoc(collection(db, 'bookmarks'), bookmarkData)
        commit('ADD_BOOKMARK', { id: docRef.id, ...bookmarkData })
      } catch (error) {
        console.error('Error adding bookmark:', error)
        throw error
      }
    },

    async removeBookmark({ commit }, bookmarkId) {
      try {
        await deleteDoc(doc(db, 'bookmarks', bookmarkId))
        commit('REMOVE_BOOKMARK', bookmarkId)
      } catch (error) {
        console.error('Error removing bookmark:', error)
        throw error
      }
    }
  }
}