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

export const notificationService = {
  subscribeToTopic: async (topic) => {
    const subscribe = httpsCallable(functions, 'subscribeToTopic')
    return await subscribe({ topic })
  },

  unsubscribeFromTopic: async (topic) => {
    const unsubscribe = httpsCallable(functions, 'unsubscribeFromTopic')
    return await unsubscribe({ topic })
  }
}

export const analyticsService = {
  trackEvent: async (eventName, eventData) => {
    const track = httpsCallable(functions, 'trackAnalyticsEvent')
    return await track({ eventName, eventData })
  }
} 