<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <!-- Loading State -->
        <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <template v-else>
          <div class="d-flex align-center mb-6">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              @click="$router.back()"
              class="mr-4"
            ></v-btn>
            <h1 class="text-h4 font-weight-bold mb-0">Edit Project</h1>
          </div>

          <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
            <!-- Title Input -->
            <v-text-field
              v-model="projectData.title"
              label="Project Title"
              :rules="titleRules"
              required
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <!-- Description Input -->
            <v-textarea
              v-model="projectData.description"
              label="Description"
              :rules="descriptionRules"
              required
              variant="outlined"
              class="mb-4"
              auto-grow
              rows="4"
            ></v-textarea>

            <!-- Tags Input -->
            <v-combobox
              v-model="projectData.tags"
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
                  (+{{ projectData.tags.length - 3 }} more)
                </span>
              </template>
            </v-combobox>

            <!-- Thumbnail Preview -->
            <div class="mb-4">
              <p class="text-subtitle-1 mb-2">Project Thumbnail</p>
              <v-img
                v-if="thumbnailPreview || projectData.thumbnail"
                :src="thumbnailPreview || projectData.thumbnail"
                width="200"
                height="200"
                cover
                class="rounded mb-2"
              ></v-img>
              
              <v-file-input
                v-model="thumbnailFile"
                accept="image/*"
                label="Change thumbnail"
                variant="outlined"
                density="comfortable"
                prepend-icon="mdi-camera"
                @update:model-value="handleThumbnailChange"
                :rules="thumbnailRules"
                show-size
              ></v-file-input>
            </div>

            <!-- Submit Button -->
            <div class="d-flex justify-end mt-6">
              <v-btn
                color="primary"
                type="submit"
                size="large"
                :loading="updating"
                :disabled="!valid || updating"
              >
                Update Project
              </v-btn>
            </div>
          </v-form>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'EditProjectView',
  data() {
    return {
      valid: false,
      loading: true,
      updating: false,
      thumbnailFile: null,
      thumbnailPreview: null,
      projectData: {
        title: '',
        description: '',
        tags: [],
        thumbnail: ''
      },
      titleRules: [
        v => !!v || 'Title is required',
        v => v.length <= 100 || 'Title must be less than 100 characters'
      ],
      descriptionRules: [
        v => !!v || 'Description is required',
        v => v.length <= 500 || 'Description must be less than 500 characters'
      ],
      tagRules: [
        v => !v || v.length <= 10 || 'Maximum 10 tags allowed',
        v => !v || v.every(tag => (typeof tag === 'string' ? tag.length <= 20 : tag.title.length <= 20)) || 'Tag must be less than 20 characters'
      ],
      thumbnailRules: [
        v => !v || v.size < 5000000 || 'Image size should be less than 5 MB',
        v => !v || v.type.startsWith('image/') || 'File must be an image'
      ],
      availableTags: [],
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.auth.user
    })
  },
  methods: {
    ...mapActions({
      fetchProject: 'projects/fetchProject',
      updateProject: 'projects/updateProject',
      fetchExploreProjects: 'projects/fetchExploreProjects'
    }),

    async loadProjectData() {
      try {
        const project = await this.fetchProject(this.$route.params.id)
        if (!project) {
          this.$router.push('/projects')
          return
        }
        
        // Check if user is the owner
        if (project.userId !== this.currentUser?.uid) {
          this.$router.push('/projects')
          return
        }

        this.projectData = {
          title: project.title,
          description: project.description,
          tags: project.tags || [],
          thumbnail: project.thumbnail
        }

        // Add this to fetch available tags
        const result = await this.fetchExploreProjects({ limit: 1 })
        this.availableTags = result.tags || []
      } catch (error) {
        console.error('Error loading project:', error)
        if (this.$toast) {
          this.$toast.error('Failed to load project')
        }
      } finally {
        this.loading = false
      }
    },

    handleTagUpdate(newTags) {
      // Filter out empty tags and trim whitespace
      this.projectData.tags = newTags
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

    getTagColor(tag) {
      return 'default' // Simplified to match CreateProjectView
    },

    handleThumbnailChange(file) {
      // Clean up previous preview URL
      if (this.thumbnailPreview) {
        URL.revokeObjectURL(this.thumbnailPreview)
        this.thumbnailPreview = null
      }

      if (!file) {
        return
      }

      // Handle v-file-input returning an array
      const imageFile = Array.isArray(file) ? file[0] : file

      if (imageFile && imageFile instanceof File) {
        this.thumbnailPreview = URL.createObjectURL(imageFile)
      }
    },

    async handleSubmit() {
      if (!this.$refs.form.validate()) return

      this.updating = true
      try {
        const thumbnailFile = Array.isArray(this.thumbnailFile) 
          ? this.thumbnailFile[0] 
          : this.thumbnailFile

        await this.updateProject({
          id: this.$route.params.id,
          ...this.projectData,
          thumbnailFile
        })

        if (this.$toast) {
          this.$toast.success('Project updated successfully')
        }
        this.$router.push(`/project/${this.$route.params.id}`)
      } catch (error) {
        console.error('Error updating project:', error)
        if (this.$toast) {
          this.$toast.error('Failed to update project')
        }
      } finally {
        this.updating = false
      }
    }
  },
  async created() {
    await this.loadProjectData()
  },
  beforeUnmount() {
    // Clean up thumbnail preview URL
    if (this.thumbnailPreview) {
      URL.revokeObjectURL(this.thumbnailPreview)
    }
  }
}
</script>

<style scoped>
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