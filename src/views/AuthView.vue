<template>
  <v-container fluid class="auth-container fill-height pa-0">
    <v-row no-gutters justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4" >
        <v-card>
          <!-- Logo and Title -->
          <v-card-item class="text-center pb-0">
            <v-card-title class="text-h4 font-weight-bold primary--text">
              CreativeHub
            </v-card-title>
          </v-card-item>

          <!-- Auth Forms -->
          <v-card-text class="pa-2">
            <v-tabs
              v-model="tab"
              color="primary"
              grow
              class="mb-6"
            >
              <v-tab value="login">
                <v-icon start>mdi-login</v-icon>
                Login
              </v-tab>
              <v-tab value="signup">
                <v-icon start>mdi-account-plus</v-icon>
                Sign Up
              </v-tab>
            </v-tabs>

            <v-window v-model="tab">
              <v-window-item value="login" eager>
                <login-form @success="handleAuthSuccess" />
              </v-window-item>

              <v-window-item value="signup" eager>
                <signup-form @success="handleAuthSuccess" />
              </v-window-item>
            </v-window>
          </v-card-text>

          <!-- Theme Toggle -->
          <v-card-actions class="justify-center">
            <v-btn
              icon
              variant="text"
              @click="toggleTheme"
            >
              <v-icon>
                {{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
              </v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      location="top"
      :timeout="3000"
    >
      {{ errorMessage }}
      
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showError = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { useTheme } from 'vuetify'
import { mapActions } from 'vuex'
import LoginForm from '@/components/auth/LoginForm.vue'
import SignupForm from '@/components/auth/SignupForm.vue'

export default {
  name: 'AuthView',
  components: {
    LoginForm,
    SignupForm
  },
  setup() {
    const theme = useTheme()
    return { theme }
  },
  data() {
    return {
      tab: this.$route.query.mode === 'signup' ? 'signup' : 'login', // Set initial tab based on query
      showError: false,
      errorMessage: ''
    }
  },
  methods: {
    ...mapActions({
      googleAuth: 'auth/googleLogin',
      initAuth: 'auth/init'
    }),
    toggleTheme() {
      this.theme.global.name.value = 
        this.theme.global.current.value.dark ? 'light' : 'dark'
    },
    async handleAuthSuccess() {
      try {
        await this.$router.push('/dashboard')
      } catch (error) {
        console.error('Navigation error:', error)
      }
    }
  },
  async created() {
    // Check if already authenticated
    await this.initAuth()
    if (this.$store.getters['auth/isAuthenticated']) {
      this.handleAuthSuccess()
    }
  }
}
</script>

<style scoped>
.auth-container {
  background: rgb(var(--v-theme-background));
}
</style>