import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  getAuth,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  updateEmail
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { useRouter } from 'vue-router'

export default {
  namespaced: true,
  state: {
    user: null,
    loading: true,
    error: null,
    authInitialized: false
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_AUTH_INITIALIZED(state, value) {
      state.authInitialized = value
    }
  },
  actions: {
    async init({ commit, state }) {
      if (state.authInitialized) return state.user
      
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      return new Promise((resolve) => {
        // Set up persistent auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {
            if (user) {
              const userDoc = await getDoc(doc(db, 'users', user.uid))
              const userData = userDoc.data()
              
              commit('SET_USER', {
                uid: user.uid,
                email: user.email,
                name: userData?.name || user.displayName,
                photoURL: userData?.photoURL || user.photoURL,
                ...userData
              })
            } else {
              commit('SET_USER', null)
            }
          } catch (error) {
            console.error('Auth state change error:', error)
            commit('SET_USER', null)
          } finally {
            commit('SET_LOADING', false)
            commit('SET_AUTH_INITIALIZED', true)
            resolve(user)
          }
        })

        // Clean up listener on app unmount
        if (import.meta.env.SSR) {
          unsubscribe()
        }
      })
    },

    async signup({ commit }, { email, password, name }) {
      commit('SET_LOADING', true)
      try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          createdAt: new Date(),
          photoURL: null
        })

        const userDoc = await getDoc(doc(db, 'users', user.uid))
        
        commit('SET_USER', {
          uid: user.uid,
          email: user.email,
          name,
          ...userDoc.data()
        })

        return user
      } catch (error) {
        console.error('Signup error:', error)
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async login({ commit }, { email, password }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.data()
        
        commit('SET_USER', {
          uid: user.uid,
          email: user.email,
          ...userData
        })

        return user
      } catch (error) {
        console.error('Login error:', error)
        let errorMessage = 'Failed to login'
        
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email'
            break
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password'
            break
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address'
            break
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled'
            break
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later'
            break
          default:
            errorMessage = error.message
        }
        
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async googleLogin({ commit }) {
      commit('SET_LOADING', true)
      try {
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        const user = result.user

        const userDoc = await getDoc(doc(db, 'users', user.uid))

        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date()
          })
        }

        commit('SET_USER', {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          ...userDoc.data()
        })

        return user
      } catch (error) {
        console.error('Google login error:', error)
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async logout({ commit }) {
      commit('SET_LOADING', true)
      try {
        await signOut(auth)
        commit('SET_USER', null)
      } catch (error) {
        console.error('Logout error:', error)
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async resetPassword({ commit }, email) {
      commit('SET_LOADING', true)
      try {
        await sendPasswordResetEmail(auth, email)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateProfile({ commit, state }, { name, bio, photoFile }) {
      const auth = getAuth()
      const user = auth.currentUser
      
      if (!user) throw new Error('No user logged in')

      try {
        let photoURL = user.photoURL

        // Handle photo upload if a new photo is provided
        if (photoFile) {
          const storage = getStorage()
          const fileExtension = photoFile.name.split('.').pop()
          const fileName = `${user.uid}.${fileExtension}`
          const photoPath = `profile-photos/${user.uid}/${fileName}`
          const photoRef = storageRef(storage, photoPath)

          // Delete old photo if it exists and URL is from our storage
          if (user.photoURL && user.photoURL.includes('firebase')) {
            try {
              const oldPhotoRef = storageRef(storage, user.photoURL)
              await deleteObject(oldPhotoRef)
            } catch (error) {
              console.warn('Old photo not found or already deleted')
            }
          }

          // Upload new photo
          await uploadBytes(photoRef, photoFile)
          photoURL = await getDownloadURL(photoRef)

          console.log('Photo uploaded successfully:', photoURL)
        }

        // Update auth profile
        await updateProfile(user, {
          displayName: name,
          photoURL: photoURL
        })

        // Update Firestore document
        const userRef = doc(db, 'users', user.uid)
        await updateDoc(userRef, {
          name,
          bio,
          photoURL,
          updatedAt: new Date()
        })

        // Update local state
        commit('SET_USER', {
          ...state.user,
          name,
          bio,
          photoURL
        })

        return true
      } catch (error) {
        console.error('Error updating profile:', error)
        if (error.code === 'storage/unauthorized') {
          throw new Error('Permission denied. Please try again later.')
        }
        throw error
      }
    },

    async updateUserPassword({ state }, { currentPassword, newPassword }) {
      const auth = getAuth()
      const user = auth.currentUser
      
      if (!user) throw new Error('No user logged in')

      try {
        // Re-authenticate user before password change
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        )
        await reauthenticateWithCredential(user, credential)
        
        // Update password
        await updatePassword(user, newPassword)
      } catch (error) {
        if (error.code === 'auth/wrong-password') {
          throw new Error('Current password is incorrect')
        }
        throw error
      }
    },

    async sendEmailVerification({ state }) {
      const auth = getAuth()
      const user = auth.currentUser
      
      if (!user) throw new Error('No user logged in')

      try {
        await sendEmailVerification(user)
      } catch (error) {
        if (error.code === 'auth/too-many-requests') {
          throw new Error('Please wait before requesting another verification email')
        }
        throw error
      }
    },

    async updateEmailNotifications({ commit, state }, enabled) {
      const auth = getAuth()
      const user = auth.currentUser
      
      if (!user) throw new Error('No user logged in')

      try {
        // Ensure we're working with a boolean value
        const notificationsEnabled = Boolean(enabled)
        
        const userRef = doc(db, 'users', user.uid)
        await updateDoc(userRef, {
          emailNotifications: notificationsEnabled,
          updatedAt: new Date()
        })

        // Update local state
        commit('SET_USER', {
          ...state.user,
          emailNotifications: notificationsEnabled
        })

        return true
      } catch (error) {
        console.error('Error updating email notifications:', error)
        throw error
      }
    },

    async signOut({ commit }) {
      try {
        await signOut(auth)
        commit('SET_USER', null)
        const router = useRouter()
        router.push('/auth')
      } catch (error) {
        console.error('Sign-out error:', error)
        throw error
      }
    },

    async handleAuthError({ commit }, error) {
      console.error('Auth error:', error)
      if (error.code === 'auth/user-token-expired' || 
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/invalid-user-token') {
        commit('SET_USER', null)
        const router = useRouter()
        router.push('/auth')
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user,
    loading: state => state.loading,
    error: state => state.error
  }
} 