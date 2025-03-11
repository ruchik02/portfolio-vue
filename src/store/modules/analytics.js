import { db } from '@/firebase/config'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'

export default {
  namespaced: true,
  
  state: {
    analyticsData: null,
    loading: false
  },

  mutations: {
    SET_ANALYTICS(state, data) {
      state.analyticsData = data
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    }
  },

  actions: {
    async fetchAnalytics({ commit, rootState }, { timeRange }) {
      const user = rootState.auth.user
      if (!user) return null

      try {
        const projectsRef = collection(db, 'projects')
        const q = query(
          projectsRef,
          where('userId', '==', user.uid)
        )
        
        const snapshot = await getDocs(q)
        const projects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Calculate analytics data
        const now = new Date()
        const rangeInDays = parseInt(timeRange)
        const startDate = new Date(now.getTime() - (rangeInDays * 24 * 60 * 60 * 1000))

        // Generate daily views data
        const viewsData = []
        for (let i = 0; i < rangeInDays; i++) {
          const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000))
          viewsData.push({
            date: date.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 100) // Replace with actual views data
          })
        }

        // Calculate totals and changes
        const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0)
        const totalLikes = projects.reduce((sum, p) => sum + (p.likes?.length || 0), 0)
        const totalComments = projects.reduce((sum, p) => sum + (p.comments?.length || 0), 0)

        return {
          totalViews,
          totalLikes,
          totalComments,
          totalProjects: projects.length,
          viewsChange: 15, // Replace with actual calculation
          likesChange: 8,
          commentsChange: 12,
          projectsChange: 5,
          viewsData,
          engagementData: {
            views: totalViews,
            likes: totalLikes,
            comments: totalComments
          }
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        throw error
      }
    },

    async fetchTopProjects({ rootState }) {
      const user = rootState.auth.user
      if (!user) return []

      try {
        const projectsRef = collection(db, 'projects')
        const q = query(
          projectsRef,
          where('userId', '==', user.uid),
          orderBy('views', 'desc'),
          limit(5)
        )

        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          views: doc.data().views || 0,
          likes: doc.data().likes?.length || 0,
          comments: doc.data().comments?.length || 0
        }))
      } catch (error) {
        console.error('Error fetching top projects:', error)
        throw error
      }
    }
  }
} 