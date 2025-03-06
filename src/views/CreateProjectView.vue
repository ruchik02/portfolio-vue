<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h5 mb-2">
            Create New Project
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="handleSubmit" ref="form">
              <!-- Project Title -->
              <v-text-field
                v-model="title"
                label="Project Title"
                :rules="titleRules"
                required
                variant="outlined"
                class="mb-4"
              ></v-text-field>

              <!-- Project Description -->
              <v-textarea
                v-model="description"
                label="Project Description"
                :rules="descriptionRules"
                required
                variant="outlined"
                class="mb-4"
                rows="4"
              ></v-textarea>

              <!-- Project Tags -->
              <v-combobox
                v-model="tags"
                :items="availableTags"
                label="Tags"
                multiple
                chips
                variant="outlined"
                class="mb-4"
                :rules="tagRules"
                @update:model-value="handleTagUpdate"
                placeholder="Enter to add new tag"
                hide-details
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip
                    v-if="index < 3"
                    :key="index"
                    size="small"
                    closable
                    color="primary"
                    variant="tonal"
                  >
                    {{ item.title || item }}
                  </v-chip>
                  <span
                    v-if="index === 3"
                    class="text-caption grey--text text--darken-1 mx-2"
                  >
                    (+{{ tags.length - 3 }} more)
                  </span>
                </template>
              </v-combobox>

              <!-- Thumbnail Upload -->
              <v-file-input
                v-model="thumbnail"
                accept="image/*"
                label="Project Thumbnail"
                variant="outlined"
                class="mb-4"
                :rules="thumbnailRules"
                @update:model-value="previewThumbnail"
                prepend-icon="mdi-image"
                show-size
              ></v-file-input>

              <!-- Thumbnail Preview -->
              <v-img
                v-if="thumbnailPreview"
                :src="thumbnailPreview"
                width="200"
                aspect-ratio="16/9"
                cover
                class="mb-4 rounded-lg"
              ></v-img>

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

              <!-- Submit Button -->
              <v-btn
                color="primary"
                type="submit"
                :loading="loading"
                :disabled="loading"
                block
                size="large"
              >
                Create Project
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'CreateProjectView',
  data() {
    return {
      title: '',
      description: '',
      tags: [],
      thumbnail: null,
      thumbnailPreview: null,
      loading: false,
      error: '',
      titleRules: [
        v => !!v || 'Title is required',
        v => v.length >= 3 || 'Title must be at least 3 characters'
      ],
      descriptionRules: [
        v => !!v || 'Description is required',
        v => v.length >= 10 || 'Description must be at least 10 characters'
      ],
      tagRules: [
        v => !v || v.length <= 10 || 'Maximum 10 tags allowed',
        v => !v || v.every(tag => (typeof tag === 'string' ? tag.length <= 20 : tag.title.length <= 20)) || 'Tag must be less than 20 characters'
      ],
      availableTags: [],
      thumbnailRules: [
        v => !v || v.size < 5000000 || 'Image size should be less than 5 MB',
        v => !v || v.type.startsWith('image/') || 'File must be an image'
      ]
    }
  },
  methods: {
    ...mapActions({
      createProject: 'projects/createProject',
      fetchProjects: 'projects/fetchProjects',
      fetchExploreProjects: 'projects/fetchExploreProjects'
    }),
    previewThumbnail(file) {
      if (this.thumbnailPreview) {
        URL.revokeObjectURL(this.thumbnailPreview)
      }
      
      if (!file) {
        this.thumbnailPreview = null
        return
      }

      // Handle v-file-input returning an array
      const imageFile = Array.isArray(file) ? file[0] : file

      if (imageFile && imageFile instanceof File) {
        this.thumbnailPreview = URL.createObjectURL(imageFile)
      } else {
        this.thumbnailPreview = null
      }
    },
    handleTagUpdate(newTags) {
      // Filter out empty tags and trim whitespace
      this.tags = newTags
        .map(tag => {
          if (typeof tag === 'string') {
            return tag.trim().toLowerCase()
          }
          return tag.title ? tag.title.trim().toLowerCase() : ''
        })
        .filter(tag => tag && tag.length > 0)
        // Remove duplicates
        .filter((tag, index, self) => self.indexOf(tag) === index)
        // Limit to 5 tags
        .slice(0, 5)
    },
    async loadAvailableTags() {
      try {
        const result = await this.fetchExploreProjects({ limit: 1 })
        this.availableTags = result.tags || []
      } catch (error) {
        console.error('Error loading tags:', error)
      }
    },
    async handleSubmit() {
      if (!this.$refs.form.validate()) return

      this.loading = true
      this.error = ''

      try {
        const thumbnailFile = Array.isArray(this.thumbnail) 
          ? this.thumbnail[0] 
          : this.thumbnail

        const projectId = await this.createProject({
          title: this.title.trim(),
          description: this.description.trim(),
          thumbnail: thumbnailFile,
          tags: this.tags.map(tag => tag.trim()).filter(tag => tag)
        })

        // Refresh projects list
        await this.fetchProjects()

        // Show success message and redirect
        this.$router.push(`/project/${projectId}`)
      } catch (error) {
        console.error('Error creating project:', error)
        this.error = error.message || 'Error creating project'
      } finally {
        this.loading = false
      }
    },
    clearForm() {
      this.$refs.form.reset()
      if (this.thumbnailPreview) {
        URL.revokeObjectURL(this.thumbnailPreview)
        this.thumbnailPreview = null
      }
    }
  },
  beforeUnmount() {
    // Clean up any object URLs when component is destroyed
    if (this.thumbnailPreview) {
      URL.revokeObjectURL(this.thumbnailPreview)
    }
  },
  async created() {
    await this.loadAvailableTags()
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}

.v-card-title {
  padding: 24px 24px 0;
}

.v-card-text {
  padding: 24px;
}

.v-img {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.v-combobox :deep(.v-field__input) {
  min-height: 44px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.v-combobox :deep(.v-field) {
  height: auto !important;
  min-height: 44px !important;
}

.v-combobox :deep(.v-chip) {
  margin: 2px;
}
</style> 