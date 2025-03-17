import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
  arrayRemove,
  arrayUnion,
  Timestamp
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { db, storage } from '@/firebase/config'
import { functionsService } from '@/services/functions'
import { auth } from '@/firebase/config'

export default {
  namespaced: true,
  state: {
    projects: [],
    loading: false,
    error: null,
    likedProjects: [],
    stats: {
      totalProjects: 0,
      totalViews: 0,
      totalLikes: 0,
      completionRate: 0
    },
    currentProject: null
  },
  mutations: {
    SET_PROJECTS(state, projects) {
      state.projects = projects
    },
    ADD_OR_UPDATE_PROJECT(state, project) {
      const index = state.projects.findIndex(p => p.id === project.id)
      if (index !== -1) {
        state.projects[index] = project
      } else {
        state.projects.push(project)
      }
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_LIKED_PROJECTS(state, projectIds) {
      state.likedProjects = projectIds
    },
    ADD_LIKED_PROJECT(state, projectId) {
      if (!state.likedProjects.includes(projectId)) {
        state.likedProjects.push(projectId)
      }
    },
    REMOVE_LIKED_PROJECT(state, projectId) {
      state.likedProjects = state.likedProjects.filter(id => id !== projectId)
    },
    SET_STATS(state, stats) {
      state.stats = stats
    },
    UPDATE_PROJECT(state, updatedProject) {
      if (state.projects) {
        const index = state.projects.findIndex(p => p.id === updatedProject.id)
        if (index !== -1) {
          state.projects.splice(index, 1, {
            ...state.projects[index],
            ...updatedProject
          })
        }
      }
      if (state.currentProject && state.currentProject.id === updatedProject.id) {
        state.currentProject = {
          ...state.currentProject,
          ...updatedProject
        }
      }
    },
    REMOVE_PROJECT(state, projectId) {
      if (state.projects) {
        state.projects = state.projects.filter(project => project.id !== projectId)
      }
    },
    SET_CURRENT_PROJECT(state, project) {
      state.currentProject = {
        ...project,
        comments: Array.isArray(project.comments) ? project.comments : []
      }
    },
    ADD_COMMENT(state, { projectId, comment }) {
      if (state.currentProject && state.currentProject.id === projectId) {
        if (!state.currentProject.comments) {
          state.currentProject.comments = []
        }
        if (comment && comment.text && comment.userName) {
          state.currentProject.comments.unshift(comment)
        }
      }
    },
    REMOVE_COMMENT(state, { projectId, commentId }) {
      if (state.currentProject && state.currentProject.id === projectId) {
        state.currentProject.comments = state.currentProject.comments.filter(
          comment => comment.id !== commentId
        )
      }
    }
  },
  actions: {
    async fetchProjects({ commit, rootState }) {
      commit('SET_LOADING', true)
      try {
        const projectsRef = collection(db, 'projects')
        const q = query(projectsRef, orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        
        const userId = rootState.auth.user?.uid
        const projects = snapshot.docs.map(doc => {
          const data = doc.data()
          const likes = Array.isArray(data.likes) ? data.likes : []
          
          return {
            id: doc.id,
            ...data,
            likes,
            isLiked: likes.includes(userId),
            likeCount: likes.length,
            createdAt: data.createdAt?.toDate() || new Date()
          }
        })

        commit('SET_PROJECTS', projects)
        return projects
      } catch (error) {
        console.error('Error fetching projects:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchUserStats({ commit, rootState }) {
      const user = rootState.auth.user
      if (!user) return null

      try {
        const projectsRef = collection(db, 'projects')
        const q = query(projectsRef, where('userId', '==', user.uid))
        const snapshot = await getDocs(q)
        
        let totalLikes = 0
        let totalViews = 0
        let totalProjects = 0

        snapshot.forEach(doc => {
          const project = doc.data()
          totalProjects++
          totalLikes += project.likes?.length || 0
          totalViews += project.views || 0
        })

        // Calculate current period stats
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
        
        let currentStats = {
          projects: 0,
          views: 0,
          likes: 0
        }
        
        let previousStats = {
          projects: 0,
          views: 0,
          likes: 0
        }

        snapshot.forEach(doc => {
          const project = doc.data()
          const createdAt = project.createdAt?.toDate() || new Date()
          
          // Count total stats
          currentStats.projects++
          currentStats.views += project.views || 0
          currentStats.likes += project.likes?.length || 0
          
          // Count previous period stats for projects created before 30 days ago
          if (createdAt < thirtyDaysAgo) {
            previousStats.projects++
            previousStats.views += project.views || 0
            previousStats.likes += project.likes?.length || 0
          }
        })

        // Calculate percentage increases
        const calculateIncrease = (current, previous) => {
          if (previous === 0) {
            return current > 0 ? 100 : null // Return null when no previous data
          }
          return Math.round(((current - previous) / previous) * 100)
        }

        // Calculate progress values
        const calculateProgress = (current, previous) => {
          if (previous === 0) return current > 0 ? 50 : 0
          return Math.min(100, (current / Math.max(1, previous)) * 50)
        }

        return {
          totalProjects,
          totalLikes,
          totalViews,
          projectsIncrease: calculateIncrease(currentStats.projects, previousStats.projects),
          viewsIncrease: calculateIncrease(currentStats.views, previousStats.views),
          likesIncrease: calculateIncrease(currentStats.likes, previousStats.likes),
          projectsProgress: calculateProgress(currentStats.projects, previousStats.projects),
          viewsProgress: calculateProgress(currentStats.views, previousStats.views),
          likesProgress: calculateProgress(currentStats.likes, previousStats.likes)
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
        throw error
      }
    },

    async fetchRecentProjects({ rootState }) {
      const user = rootState.auth.user
      if (!user) return []

      try {
        const projectsRef = collection(db, 'projects')
        const q = query(
          projectsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(6)
        )

        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => {
          const data = doc.data()
          // Ensure likes is always an array
          const likes = Array.isArray(data.likes) ? data.likes : []
          
          return {
            id: doc.id,
            ...data,
            likes, // Add the normalized likes array
            isLiked: likes.includes(user.uid),
            likesCount: likes.length,
            createdAt: data.createdAt?.toDate() || new Date()
          }
        })
      } catch (error) {
        console.error('Error fetching recent projects:', error)
        // Return empty array instead of throwing to prevent UI breaks
        return []
      }
    },

    async fetchAllProjects({ commit, state }) {
      try {
        const projectsRef = collection(db, 'projects')
        const q = query(
          projectsRef,
          where('userId', '==', auth.currentUser.uid),
          orderBy('createdAt', 'desc')
        )
        
        const snapshot = await getDocs(q)
        const projects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isLiked: state.likedProjects.includes(doc.id)
        }))
        
        commit('SET_PROJECTS', projects)
        return projects
      } catch (error) {
        console.error('Error fetching all projects:', error)
        throw error
      }
    },

    async createProject({ commit, rootState }, { title, description, thumbnail, tags }) {
      const userId = rootState.auth.user?.uid
      if (!userId) throw new Error('User not authenticated')

      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      let thumbnailUrl = null
      let thumbnailPath = null

      try {
        // Upload thumbnail if provided
        if (thumbnail) {
          // Create a unique filename
          const fileName = `${Date.now()}-${thumbnail.name}`
          thumbnailPath = `thumbnails/${userId}/${fileName}`
          const storageRef = ref(storage, thumbnailPath)

          // Upload the file
          await uploadBytes(storageRef, thumbnail)
          thumbnailUrl = await getDownloadURL(storageRef)
        }

        // Create project document
        const projectRef = await addDoc(collection(db, 'projects'), {
          userId,
          title,
          description,
          thumbnail: thumbnailUrl,
          thumbnailPath, // Store the path for later deletion if needed
          tags,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          views: 0,
          likes: 0,
          tasks: [],
          status: 'Active'
        })

        return projectRef.id

      } catch (error) {
        console.error('Error creating project:', error)
        
        // Clean up uploaded file if project creation fails
        if (thumbnailPath) {
          try {
            const storageRef = ref(storage, thumbnailPath)
            await deleteObject(storageRef)
          } catch (deleteError) {
            console.error('Error deleting thumbnail:', deleteError)
          }
        }

        if (error.code === 'storage/unauthorized') {
          commit('SET_ERROR', 'Permission denied: Unable to upload image')
        } else {
          commit('SET_ERROR', 'Failed to create project')
        }
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateProject({ commit, rootState }, projectData) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const { id, title, description, tags, thumbnailFile } = projectData
        const projectRef = doc(db, 'projects', id)

        // Get current user ID
        const userId = rootState.auth.user.uid

        // Upload new thumbnail if provided
        let thumbnailUrl = projectData.thumbnail
        if (thumbnailFile) {
          const timestamp = Date.now()
          const fileName = `${timestamp}-${thumbnailFile.name}`
          const storagePath = `thumbnails/${userId}/${fileName}` // Store in user's thumbnails folder
          const storageRef = ref(storage, storagePath)
          
          await uploadBytes(storageRef, thumbnailFile)
          thumbnailUrl = await getDownloadURL(storageRef)

          // Delete old thumbnail if exists
          if (projectData.thumbnail) {
            try {
              const oldThumbnailRef = ref(storage, projectData.thumbnail)
              await deleteObject(oldThumbnailRef)
            } catch (error) {
              console.warn('Error deleting old thumbnail:', error)
            }
          }
        }

        // Update project document
        await updateDoc(projectRef, {
          title,
          description,
          tags,
          thumbnail: thumbnailUrl,
          updatedAt: serverTimestamp()
        })

        // Update local state
        commit('UPDATE_PROJECT', {
          id,
          title,
          description,
          tags,
          thumbnail: thumbnailUrl
        })

        return true
      } catch (error) {
        console.error('Error updating project:', error)
        commit('SET_ERROR', 'Failed to update project')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async deleteProject({ commit, rootState }, { id, thumbnailPath }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const userId = rootState.auth.user.uid

        // Delete thumbnail if exists
        if (thumbnailPath) {
          try {
            // Extract the actual path from the full URL
            let storagePath = thumbnailPath
            
            // If it's a full URL, extract just the path portion
            if (thumbnailPath.includes('firebasestorage.googleapis.com')) {
              // Extract the path after /o/
              const pathMatch = thumbnailPath.match(/o\/(.*?)\?/)
              if (pathMatch && pathMatch[1]) {
                storagePath = decodeURIComponent(pathMatch[1])
              }
            }

            // Create storage reference and delete
            const storageRef = ref(storage, `thumbnails/${userId}/${storagePath.split('/').pop()}`)
            await deleteObject(storageRef)

          } catch (storageError) {
            console.error('Error deleting thumbnail:', storageError)
            // Continue with project deletion even if thumbnail deletion fails
          }
        }

        // Delete project document
        const projectRef = doc(db, 'projects', id)
        await deleteDoc(projectRef)

        // Update local state
        commit('REMOVE_PROJECT', id)
        return true
      } catch (error) {
        console.error('Error deleting project:', error)
        commit('SET_ERROR', 'Failed to delete project')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async viewProject({ commit }, projectId) {
      try {
        await functionsService.recordProjectView(projectId)
      } catch (error) {
        console.error('Error viewing project:', error)
        throw error
      }
    },

    async fetchProject({ commit, rootState }, projectId) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        const projectRef = doc(db, 'projects', projectId)
        const projectSnap = await getDoc(projectRef)

        if (!projectSnap.exists()) {
          throw new Error('Project not found')
        }

        const projectData = projectSnap.data()

        // Get project owner details from users collection
        const ownerRef = doc(db, 'users', projectData.userId)
        const ownerSnap = await getDoc(ownerRef)
        const ownerData = ownerSnap.exists() ? ownerSnap.data() : {}

        // Get comments
        const commentsRef = collection(projectRef, 'comments')
        const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'))
        const commentsSnap = await getDocs(commentsQuery)

        // Process comments and get user data for each comment
        const comments = await Promise.all(commentsSnap.docs.map(async (commentDoc) => {
          const commentData = commentDoc.data()
          
          // Get comment author details from users collection
          const commentUserRef = doc(db, 'users', commentData.userId)
          const commentUserSnap = await getDoc(commentUserRef)
          const commentUserData = commentUserSnap.exists() ? commentUserSnap.data() : {}

          return {
            id: commentDoc.id,
            text: commentData.text,
            userId: commentData.userId,
            userName: commentUserData.displayName || commentData.userName,
            userPhotoURL: commentUserData.photoURL || commentData.userPhotoURL,
            createdAt: commentData.createdAt?.toDate()?.toISOString() || new Date().toISOString()
          }
        }))

        // Ensure likes is an array
        const likes = Array.isArray(projectData.likes) ? projectData.likes : []
        const userId = rootState.auth.user?.uid

        // Combine project data with owner and comments data
        const project = {
          id: projectSnap.id,
          ...projectData,
          userName: ownerData.displayName || projectData.userName,
          userPhotoURL: ownerData.photoURL || projectData.userPhotoURL,
          comments: comments,
          likes,
          likeCount: likes.length,
          isLiked: userId ? likes.includes(userId) : false,
          createdAt: projectData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
          updatedAt: projectData.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
        }

        commit('SET_CURRENT_PROJECT', project)
        return project

      } catch (error) {
        console.error('Error fetching project:', error)
        commit('SET_ERROR', 'Failed to fetch project')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchLikedProjects({ commit, rootState }) {
      const userId = rootState.auth.user?.uid
      if (!userId) return []

      commit('SET_LOADING', true)
      try {
        // Simplified query that doesn't require a composite index
        const projectsRef = collection(db, 'projects')
        const likedProjectsQuery = query(
          projectsRef,
          where('likes', 'array-contains', userId)
          // Temporarily remove orderBy until index is ready
          // orderBy('createdAt', 'desc')
        )
        
        const snapshot = await getDocs(likedProjectsQuery)
        let likedProjects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          isLiked: true
        }))

        // Sort in memory instead
        likedProjects.sort((a, b) => b.createdAt - a.createdAt)

        return likedProjects
      } catch (error) {
        console.error('Error fetching liked projects:', error)
        return [] // Return empty array instead of throwing
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async toggleLike({ commit, rootState }, project) {
      if (!rootState.auth.user) return project

      const userId = rootState.auth.user.uid
      const projectRef = doc(db, 'projects', project.id)

      try {
        // Get fresh project data
        const projectDoc = await getDoc(projectRef)
        if (!projectDoc.exists()) {
          throw new Error('Project not found')
        }

        const currentProject = projectDoc.data()
        const likes = currentProject.likes || []
        const isLiked = likes.includes(userId)

        // Update likes array
        let updatedLikes
        if (isLiked) {
          updatedLikes = likes.filter(id => id !== userId)
        } else {
          updatedLikes = [...likes, userId]
        }

        // Update project in Firestore
        await updateDoc(projectRef, {
          likes: updatedLikes,
          updatedAt: Timestamp.now()
        })

        // Return updated project data
        return {
          ...project,
          likes: updatedLikes,
          isLiked: !isLiked,
          likesCount: updatedLikes.length
        }
      } catch (error) {
        console.error('Error toggling like:', error)
        throw error
      }
    },

    async addComment({ commit, rootState }, { projectId, text }) {
      try {
        const user = rootState.auth.user
        if (!user) throw new Error('User not authenticated')

        // Get current user data from users collection
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)
        const userData = userSnap.exists() ? userSnap.data() : {}

        // Ensure we have a valid userName
        const userName = userData.displayName || 
                        user.displayName || 
                        user.email?.split('@')[0] || 
                        `User_${user.uid.slice(0, 5)}`

        const commentData = {
          text,
          userId: user.uid,
          userName, // Use the determined userName
          userEmail: user.email,
          userPhotoURL: userData.photoURL || user.photoURL || null,
          createdAt: serverTimestamp()
        }

        // Validate comment data before saving
        if (!commentData.text || !commentData.userId || !commentData.userName) {
          throw new Error('Invalid comment data')
        }

        // Add comment to subcollection
        const projectRef = doc(db, 'projects', projectId)
        const commentsRef = collection(projectRef, 'comments')
        const commentDoc = await addDoc(commentsRef, commentData)

        // Prepare comment for local state update
        const newComment = {
          id: commentDoc.id,
          ...commentData,
          createdAt: new Date().toISOString()
        }

        // Update local state
        commit('ADD_COMMENT', { projectId, comment: newComment })

        // Fetch fresh project data to ensure consistency
        await this.dispatch('projects/fetchProject', projectId)

        return newComment
      } catch (error) {
        console.error('Error adding comment:', error)
        throw error
      }
    },

    async removeComment({ commit, rootState }, { projectId, commentId }) {
      try {
        const user = rootState.auth.user
        if (!user) throw new Error('User not authenticated')

        const projectRef = doc(db, 'projects', projectId)
        const commentRef = doc(collection(projectRef, 'comments'), commentId)
        
        await deleteDoc(commentRef)

        // Update local state
        commit('REMOVE_COMMENT', { projectId, commentId })
        return true
      } catch (error) {
        console.error('Error removing comment:', error)
        throw error
      }
    },

    async initializeApp({ dispatch }) {
      try {
        // Fetch everything in parallel
        await Promise.all([
          dispatch('fetchProjects'),
          dispatch('fetchUserStats')
        ])
      } catch (error) {
        console.error('Error initializing app:', error)
        throw error
      }
    },

    async fetchProjectAnalytics({ rootState }, projectId) {
      const projectRef = doc(db, 'projects', projectId)
      
      // Use sub-collections for detailed analytics
      const analyticsRef = collection(projectRef, 'analytics')
      const viewsRef = collection(analyticsRef, 'views')
      const likesRef = collection(analyticsRef, 'likes')
      
      const [viewsSnap, likesSnap] = await Promise.all([
        getDocs(viewsRef),
        getDocs(likesRef)
      ])

      return {
        viewsHistory: viewsSnap.docs.map(doc => ({
          date: doc.id,
          count: doc.data().count
        })),
        likesHistory: likesSnap.docs.map(doc => ({
          date: doc.id,
          count: doc.data().count
        }))
      }
    }
  },
  getters: {
    getProjects: state => state.projects,
    getProjectById: state => id => state.projects.find(p => p.id === id),
    isProjectLiked: state => projectId => state.likedProjects.includes(projectId),
    loading: state => state.loading,
    error: state => state.error,
    getStats: state => state.stats
  }
} 