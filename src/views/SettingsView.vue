<template>
  <v-container v-if="currentUser">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-h4 mb-6">Settings</h1>

        <!-- Account Settings Card -->
        <v-card class="mb-6" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-shield-account" class="mr-2"></v-icon>
            Account Settings
          </v-card-title>

          <v-card-text>
            <!-- Profile Summary -->
            <div class="d-flex align-center mb-6">
              <v-avatar size="64" color="primary" class="mr-4">
                <template v-if="currentUser?.photoURL">
                  <v-img
                    :src="currentUser.photoURL"
                    :alt="currentUser.name || 'User'"
                    cover
                  >
                    <template #loading>
                      <v-progress-circular indeterminate></v-progress-circular>
                    </template>
                  </v-img>
                </template>
                <template v-else>
                  <v-icon size="large">mdi-account-circle</v-icon>
                </template>
              </v-avatar>
              <div>
                <div class="text-h6">{{ currentUser?.name || 'User' }}</div>
                <div class="text-subtitle-2 text-medium-emphasis">
                  <v-icon size="small" class="mr-1">mdi-email</v-icon>
                  {{ currentUser?.email }}
                  <v-chip
                    :color="isEmailVerified ? 'success' : 'warning'"
                    size="x-small"
                    class="ml-2"
                  >
                    {{ isEmailVerified ? 'Verified' : 'Not Verified' }}
                  </v-chip>
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                variant="text"
                to="/profile"
                prepend-icon="mdi-account-edit"
              >
                Edit Profile
              </v-btn>
            </div>

            <!-- Email Verification -->
            <div v-if="!isEmailVerified" class="mb-6">
              <v-alert
                type="warning"
                variant="tonal"
                class="mb-3"
              >
                Please verify your email address to access all features
              </v-alert>
              <div class="d-flex">
                <v-btn
                  color="warning"
                  :loading="verifyLoading"
                  :disabled="verificationCooldown > 0"
                  @click="sendVerificationEmail"
                >
                  {{ verificationCooldown > 0 
                    ? `Resend in ${verificationCooldown}s` 
                    : 'Send Verification Email' 
                  }}
                </v-btn>
                <v-btn
                  color="warning"
                  variant="text"
                  :loading="checkingVerification"
                  class="ml-2"
                  @click="checkVerificationStatus"
                >
                  Check Status
                </v-btn>
              </div>
            </div>

            <!-- Security Settings -->
            <v-divider class="mb-6"></v-divider>
            <div class="text-h6 mb-4">Security</div>
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-lock-reset"
              @click="changePasswordDialog = true"
              class="mb-4"
              block
            >
              Change Password
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Preferences Card -->
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-cog" class="mr-2"></v-icon>
            Preferences
          </v-card-title>

          <v-card-text>
            <div class="text-subtitle-1 mb-4">Display</div>
            <v-switch
              v-model="darkMode"
              color="primary"
              hide-details
              class="mb-6"
              @change="toggleTheme"
            >
              <template v-slot:label>
                <div class="d-flex align-center">
                  <v-icon :icon="darkMode ? 'mdi-weather-night' : 'mdi-weather-sunny'" class="mr-2"></v-icon>
                  Dark Mode
                </div>
              </template>
            </v-switch>

            <v-divider class="mb-4"></v-divider>
            
            <div class="text-subtitle-1 mb-4">Notifications</div>
            <v-switch
              v-model="emailNotifications"
              :disabled="!isEmailVerified"
              color="primary"
              hide-details
              class="mb-2"
              @update:model-value="updateNotifications"
            >
              <template v-slot:label>
                <div>
                  Email Notifications
                  <div class="text-caption text-medium-emphasis">
                    Receive email updates about account activity
                  </div>
                </div>
              </template>
            </v-switch>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Change Password Dialog -->
    <v-dialog v-model="changePasswordDialog" max-width="500">
      <v-card>
        <v-card-title>Change Password</v-card-title>
        <v-card-text>
          <v-form ref="passwordForm" @submit.prevent="updatePassword">
            <v-text-field
              v-model="currentPassword"
              label="Current Password"
              type="password"
              variant="outlined"
              :rules="passwordRules"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="newPassword"
              label="New Password"
              type="password"
              variant="outlined"
              :rules="passwordRules"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="confirmPassword"
              label="Confirm New Password"
              type="password"
              variant="outlined"
              :rules="[...passwordRules, passwordMatchRule]"
              class="mb-4"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="changePasswordDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="passwordLoading"
            @click="updatePassword"
          >
            Update Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
      
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { useTheme } from 'vuetify'
import { mapGetters, mapActions } from 'vuex'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'SettingsView',
  setup() {
    const theme = useTheme()
    const router = useRouter()
    return { theme, router }
  },
  data() {
    return {
      darkMode: false,
      emailNotifications: false,
      changePasswordDialog: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      verifyLoading: false,
      checkingVerification: false,
      verificationCooldown: 0,
      passwordLoading: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters'
      ]
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/currentUser'
    }),
    isEmailVerified() {
      const auth = getAuth()
      return auth.currentUser?.emailVerified || false
    },
    passwordMatchRule() {
      return () => this.newPassword === this.confirmPassword || 'Passwords must match'
    }
  },
  watch: {
    currentUser(newValue) {
      if (!newValue) {
        this.$router.push('/auth')
      }
    }
  },
  methods: {
    ...mapActions({
      updateUserPassword: 'auth/updatePassword',
      sendEmailVerification: 'auth/sendEmailVerification'
    }),
    toggleTheme() {
      this.theme.global.name.value = this.darkMode ? 'dark' : 'light'
    },
    async updatePassword() {
      if (!this.$refs.passwordForm.validate()) return

      this.passwordLoading = true
      try {
        await this.updateUserPassword({
          currentPassword: this.currentPassword,
          newPassword: this.newPassword
        })
        this.changePasswordDialog = false
        this.showMessage('Password updated successfully')
        this.currentPassword = ''
        this.newPassword = ''
        this.confirmPassword = ''
      } catch (error) {
        console.error('Error updating password:', error)
        this.showMessage(error.message, 'error')
      } finally {
        this.passwordLoading = false
      }
    },
    async sendVerificationEmail() {
      if (this.verificationCooldown > 0) return

      this.verifyLoading = true
      try {
        await this.sendEmailVerification()
        this.showMessage('Verification email sent')
        this.startVerificationCooldown()
      } catch (error) {
        this.showMessage(error.message, 'error')
      } finally {
        this.verifyLoading = false
      }
    },
    startVerificationCooldown() {
      this.verificationCooldown = 60
      const timer = setInterval(() => {
        this.verificationCooldown--
        if (this.verificationCooldown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    async checkVerificationStatus() {
      this.checkingVerification = true
      try {
        const auth = getAuth()
        await auth.currentUser?.reload()
        
        if (auth.currentUser?.emailVerified) {
          this.showMessage('Email verified successfully!', 'success')
        } else {
          this.showMessage('Email not yet verified', 'warning')
        }
      } catch (error) {
        this.showMessage('Error checking verification status', 'error')
      } finally {
        this.checkingVerification = false
      }
    },
    showMessage(text, color = 'success') {
      this.snackbar.text = text
      this.snackbar.color = color
      this.snackbar.show = true
    },
    async checkAuth() {
      if (!this.currentUser) {
        await this.$router.push('/auth')
      }
    }
  },
  created() {
    this.checkAuth()
    if (!this.currentUser) {
      this.router.push('/auth')
      return
    }

    this.darkMode = this.theme.global.current.value.dark
    this.emailNotifications = this.currentUser?.emailNotifications || false
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}

.v-card-title {
  padding: 20px;
}

.v-card-text {
  padding: 20px;
}
</style> 