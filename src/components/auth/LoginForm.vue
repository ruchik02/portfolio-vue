<template>
  <v-form @submit.prevent="handleLogin" ref="form">
    <v-text-field
      v-model="email"
      label="Email"
      type="email"
      :rules="emailRules"
      required
      prepend-icon="mdi-email"
      :error-messages="emailError"
      :disabled="loading"
      @input="clearErrors"
    ></v-text-field>

    <v-text-field
      v-model="password"
      label="Password"
      :type="showPassword ? 'text' : 'password'"
      :rules="passwordRules"
      required
      prepend-icon="mdi-lock"
      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      @click:append="showPassword = !showPassword"
      :error-messages="passwordError"
      :disabled="loading"
      @input="clearErrors"
    ></v-text-field>

    <!-- Success Alert for Password Reset -->
    <v-alert
      v-if="resetSuccess"
      type="success"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="resetSuccess = false"
    >
      Password reset email sent! Please check your inbox and spam folder.
    </v-alert>

    <!-- Error Alert -->
    <v-alert
      v-if="error || authError"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="clearErrors"
    >
      {{ error || authError }}
    </v-alert>

    <v-btn
      block
      color="primary"
      type="submit"
      :loading="loading"
      :disabled="!isFormValid || loading"
      class="mt-4"
    >
      Login
    </v-btn>

    <v-divider class="my-4"></v-divider>

    <div class="text-center mb-4">
      <span class="text-medium-emphasis">Or continue with</span>
    </div>

    <v-btn
      block
      color="error"
      @click="handleGoogleLogin"
      :loading="googleLoading"
      :disabled="loading"
      prepend-icon="mdi-google"
    >
      Login with Google
    </v-btn>

    <!-- Forgot Password Link -->
    <div class="text-center mt-4">
      <v-btn
        variant="text"
        color="primary"
        density="comfortable"
        @click="handleForgotPassword"
        :disabled="loading || !email"
      >
        Forgot Password?
      </v-btn>
    </div>

    <!-- Password Reset Dialog -->
    <v-dialog v-model="showResetDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          Reset Password
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="mb-4">Enter your email address to receive a password reset link.</p>
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            :rules="emailRules"
            required
            prepend-icon="mdi-email"
            :error-messages="emailError"
            :disabled="loading"
            @input="clearErrors"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showResetDialog = false"
            :disabled="loading"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmResetPassword"
            :loading="loading"
            :disabled="!email || loading"
          >
            Send Reset Link
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      googleLoading: false,
      error: '',
      emailError: '',
      passwordError: '',
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid'
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters'
      ],
      showResetDialog: false,
      resetSuccess: false,
    }
  },
  computed: {
    ...mapGetters({
      authError: 'auth/error'
    }),
    isFormValid() {
      return this.email && 
             this.password && 
             this.email.includes('@') && 
             this.password.length >= 6
    }
  },
  methods: {
    ...mapActions({
      login: 'auth/login',
      googleLogin: 'auth/googleLogin',
      resetPassword: 'auth/resetPassword'
    }),
    clearErrors() {
      this.error = ''
      this.emailError = ''
      this.passwordError = ''
      this.$store.commit('auth/SET_ERROR', null)
    },
    async handleLogin() {
      this.clearErrors()
      if (!this.$refs.form.validate()) return

      this.loading = true
      try {
        await this.login({
          email: this.email,
          password: this.password
        })
        await this.$router.push('/dashboard')
      } catch (error) {
        console.error('Login error:', error)
        this.handleAuthError(error)
      } finally {
        this.loading = false
      }
    },
    async handleGoogleLogin() {
      this.clearErrors()
      this.googleLoading = true
      try {
        await this.googleLogin()
        await this.$router.push('/dashboard')
      } catch (error) {
        console.error('Google login error:', error)
        this.handleAuthError(error)
      } finally {
        this.googleLoading = false
      }
    },
    handleForgotPassword() {
      this.clearErrors()
      this.showResetDialog = true
    },
    async confirmResetPassword() {
      if (!this.email) {
        this.emailError = 'Please enter your email address'
        return
      }
      
      this.loading = true
      try {
        await this.resetPassword(this.email)
        this.showResetDialog = false
        this.resetSuccess = true
        setTimeout(() => {
          this.resetSuccess = false
        }, 6000) // Hide success message after 6 seconds
      } catch (error) {
        this.handleAuthError(error)
      } finally {
        this.loading = false
      }
    },
    handleAuthError(error) {
      switch(error.code) {
        case 'auth/user-not-found':
          this.emailError = 'No account found with this email'
          this.error = 'If this email exists, you will receive a password reset link'
          break
        case 'auth/wrong-password':
          this.passwordError = 'Incorrect password'
          this.error = 'Invalid email or password'
          break
        case 'auth/too-many-requests':
          this.error = 'Too many failed attempts. Please try again later'
          break
        case 'auth/invalid-email':
          this.emailError = 'Invalid email address'
          break
        case 'auth/network-request-failed':
          this.error = 'Network error. Please check your internet connection'
          break
        case 'auth/operation-not-allowed':
          this.error = 'This login method is not enabled'
          break
        default:
          this.error = error.message || 'An error occurred during login'
      }
    }
  }
}
</script>

<style scoped>
.v-form {
  width: 100%;
}

.v-alert {
  margin-bottom: 16px;
}
</style> 