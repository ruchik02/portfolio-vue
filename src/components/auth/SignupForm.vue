<template>
  <v-form @submit.prevent="handleSignup" ref="form">
    <v-text-field
      v-model="name"
      label="Full Name"
      :rules="nameRules"
      required
      prepend-icon="mdi-account"
      :error-messages="nameError"
      :disabled="loading"
      @input="clearErrors"
    ></v-text-field>

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

    <v-text-field
      v-model="confirmPassword"
      label="Confirm Password"
      :type="showPassword ? 'text' : 'password'"
      :rules="confirmPasswordRules"
      required
      prepend-icon="mdi-lock-check"
      :error-messages="confirmPasswordError"
      :disabled="loading"
      @input="clearErrors"
    ></v-text-field>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <v-btn
      block
      color="primary"
      type="submit"
      :loading="loading"
      :disabled="!isFormValid || loading"
      class="mt-4"
    >
      Sign Up
    </v-btn>

    <v-divider class="my-4"></v-divider>

    <div class="text-center mb-4">
      <span class="text-medium-emphasis">Or continue with</span>
    </div>

    <v-btn
      block
      color="error"
      @click="handleGoogleSignup"
      :loading="googleLoading"
      :disabled="loading"
      prepend-icon="mdi-google"
    >
      Sign up with Google
    </v-btn>
  </v-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'SignupForm',
  emits: ['success'],
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      loading: false,
      googleLoading: false,
      error: '',
      nameError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length >= 2 || 'Name must be at least 2 characters'
      ],
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid'
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters',
        v => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
        v => /[0-9]/.test(v) || 'Password must contain at least one number'
      ],
      confirmPasswordRules: [
        v => !!v || 'Please confirm your password',
        v => v === this.password || 'Passwords must match'
      ]
    }
  },
  computed: {
    isFormValid() {
      return this.name &&
             this.name.length >= 2 &&
             this.email &&
             this.email.includes('@') &&
             this.password &&
             this.password.length >= 6 &&
             /[A-Z]/.test(this.password) &&
             /[0-9]/.test(this.password) &&
             this.confirmPassword &&
             this.password === this.confirmPassword
    },
    ...mapGetters({
      authError: 'auth/error'
    })
  },
  watch: {
    authError(newError) {
      if (newError) {
        this.error = newError
      }
    }
  },
  methods: {
    ...mapActions({
      signup: 'auth/signup',
      googleLogin: 'auth/googleLogin'
    }),
    clearErrors() {
      this.error = ''
      this.nameError = ''
      this.emailError = ''
      this.passwordError = ''
      this.confirmPasswordError = ''
    },
    async handleSignup() {
      if (!this.$refs.form.validate()) return
      
      this.loading = true
      this.clearErrors()

      try {
        await this.signup({
          email: this.email,
          password: this.password,
          name: this.name
        })
        this.$emit('success')
      } catch (error) {
        console.error('Signup error:', error)
        this.error = error.message || 'Failed to create account'
      } finally {
        this.loading = false
      }
    },
    async handleGoogleSignup() {
      this.clearErrors()
      this.googleLoading = true
      try {
        await this.googleLogin()
        this.$emit('success')
      } catch (error) {
        console.error('Google signup error:', error)
        this.error = error.message || 'Failed to sign up with Google'
      } finally {
        this.googleLoading = false
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