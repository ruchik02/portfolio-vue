import { functions } from '@/firebase/config'
import { httpsCallable } from 'firebase/functions'

export const functionsService = {
  // Record project view
  recordProjectView: async (projectId) => {
    try {
      const recordView = httpsCallable(functions, 'recordProjectView')
      const result = await recordView({ projectId })
      return result.data
    } catch (error) {
      console.error('Error recording view:', error)
      throw error
    }
  },

  // Add more function calls here
} 