export default {
  namespaced: true,
  state: {
    isDark: false
  },
  getters: {
    isDark: (state) => state.isDark
  },
  mutations: {
    TOGGLE_THEME(state) {
      state.isDark = !state.isDark;
    },
    SET_THEME(state, isDark) {
      state.isDark = isDark;
    }
  },
  actions: {
    toggleTheme({ commit }) {
      commit('TOGGLE_THEME');
    },
    setTheme({ commit }, isDark) {
      commit('SET_THEME', isDark);
    }
  }
}; 