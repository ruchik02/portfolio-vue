import { createStore } from 'vuex'
import auth from './modules/auth'
import projects from './modules/projects'
import notifications from './modules/notifications'
import theme from './modules/theme'
import bookmark from './modules/bookmark'
import analytics from './modules/analytics'

export default createStore({
  state: {
    
  },
  mutations: {
    
  },
  actions: {
    // Actions will be implemented later
  },
  modules: {
    auth,
    projects,
    notifications,
    theme,
    bookmark,
    analytics
  }
}) 