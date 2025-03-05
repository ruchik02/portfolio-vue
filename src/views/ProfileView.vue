<template>
  <v-container v-if="currentUser">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-h4 mb-6">Profile</h1>

        <!-- Profile Information Card -->
        <v-card class="mb-6">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-account" class="mr-2"></v-icon>
            Profile Information
          </v-card-title>

          <v-card-text>
            <!-- Profile Header -->
            <div class="text-center mb-6">
              <v-avatar size="150" class="mb-4">
                <template v-if="imageUploading">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                </template>
                <template v-else-if="imagePreview || currentUser?.photoURL">
                  <v-img
                    :src="imagePreview || currentUser.photoURL"
                    alt="Profile"
                    cover
                  ></v-img>
                </template>
                <template v-else>
                  <v-icon size="large">mdi-account-circle</v-icon>
                </template>
              </v-avatar>

              <h2 class="text-h5 mb-2">{{ currentUser.name || 'User' }}</h2>
              <div class="text-body-1 text-medium-emphasis mb-4">
                <v-icon size="small" class="mr-1">mdi-email</v-icon>
                {{ currentUser.email }}
                <v-chip
                  :color="isEmailVerified ? 'success' : 'warning'"
                  size="x-small"
                  class="ml-2"
                >
                  {{ isEmailVerified ? 'Verified' : 'Not Verified' }}
                </v-chip>
              </div>
              
              <div v-if="currentUser.bio" class="text-body-1 mb-4">
                {{ currentUser.bio }}
              </div>
            </div>

            <v-divider class="mb-6"></v-divider>

            <!-- Edit Profile Form -->
            <v-form @submit.prevent="updateProfile" ref="profileForm">
              <div class="mb-4">
                <v-file-input
                  v-model="profileImage"
                  accept="image/*"
                  label="Change Profile Picture"
                  variant="outlined"
                  density="comfortable"
                  prepend-icon="mdi-camera"
                  @update:model-value="previewImage"
                  hide-details
                ></v-file-input>
              </div>

              <v-text-field
                v-model="form.name"
                label="Display Name"
                variant="outlined"
                :rules="nameRules"
                prepend-icon="mdi-account"
                class="mb-4"
              ></v-text-field>

              <v-textarea
                v-model="form.bio"
                label="Bio"
                variant="outlined"
                :rules="bioRules"
                prepend-icon="mdi-card-text"
                rows="3"
                class="mb-4"
                placeholder="Tell us about yourself"
              ></v-textarea>

              <v-btn
                color="primary"
                type="submit"
                :loading="loading"
                block
                class="mb-4"
              >
                Update Profile
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
import { useRouter } from 'vue-router'
import { mapGetters, mapActions } from 'vuex'
import { getAuth } from 'firebase/auth'

export default {
  name: 'ProfileView',
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      form: {
        name: '',
        bio: ''
      },
      profileImage: null,
      imagePreview: null,
      loading: false,
      imageUploading: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length >= 2 || 'Name must be at least 2 characters'
      ],
      bioRules: [
        v => !v || v.length <= 500 || 'Bio must be less than 500 characters'
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
    }
  },
  watch: {
    currentUser(newValue) {
      if (!newValue) {
        this.router.push('/auth')
      }
    }
  },
  methods: {
    ...mapActions({
      updateUserProfile: 'auth/updateProfile'
    }),
    previewImage(file) {
      if (this.imagePreview) {
        URL.revokeObjectURL(this.imagePreview)
      }
      
      if (!file) {
        this.imagePreview = null
        return
      }

      if (file instanceof File) {
        this.imagePreview = URL.createObjectURL(file)
      }
    },
    async updateProfile() {
      if (!this.$refs.profileForm.validate()) return

      // Validate file size and type
      if (this.profileImage) {
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (this.profileImage.size > maxSize) {
          this.showMessage('Image must be less than 5MB', 'error')
          return
        }

        if (!this.profileImage.type.startsWith('image/')) {
          this.showMessage('File must be an image', 'error')
          return
        }
      }

      this.loading = true
      this.imageUploading = !!this.profileImage
      try {
        await this.updateUserProfile({
          name: this.form.name,
          bio: this.form.bio,
          photoFile: this.profileImage
        })
        this.showMessage('Profile updated successfully')
        this.imagePreview = null
        this.profileImage = null
      } catch (error) {
        console.error('Error updating profile:', error)
        this.showMessage(
          error.code === 'storage/unauthorized' 
            ? 'Permission denied. Please try again.' 
            : error.message || 'Error updating profile', 
          'error'
        )
      } finally {
        this.loading = false
        this.imageUploading = false
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

    this.form.name = this.currentUser.name || ''
    this.form.bio = this.currentUser.bio || ''
  },
  beforeUnmount() {
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview)
    }
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}
</style> 