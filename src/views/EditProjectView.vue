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
              label="Tags"
              multiple
              chips
              variant="outlined"
              class="mb-4"
              :rules="tagRules"
              @update:model-value="handleTagUpdate"
            >
              <template v-slot:chip="{ props, item }">
                <v-chip
                  v-bind="props"
                  :color="getTagColor(item.raw || item)"
                  closable
                  class="tag-chip"
                  variant="elevated"
                  label
                >
                  {{ item.raw || item }}
                </v-chip>
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
        v => v.length <= 5 || 'Maximum 5 tags allowed'
      ],
      thumbnailRules: [
        v => !v || v.size < 5000000 || 'Image size should be less than 5 MB',
        v => !v || v.type.startsWith('image/') || 'File must be an image'
      ],
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
      updateProject: 'projects/updateProject'
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
        .map(tag => typeof tag === 'string' ? tag.trim().toLowerCase() : tag)
        .filter(tag => tag && tag.length > 0)
    },

    getTagColor(tag) {
      const tagColors = {
        html: 'orange',
        css: 'blue',
        javascript: 'yellow darken-2',
        vue: 'green',
        react: 'light-blue',
        angular: 'red',
        firebase: 'amber darken-2',
        nodejs: 'green darken-2',
        python: 'blue darken-2',
        java: 'deep-orange',
        typescript: 'blue-grey',
        php: 'purple',
        ruby: 'red darken-2'
      }
      return tagColors[tag.toLowerCase()] || 'grey'
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
  padding-top: 0;
  padding-bottom: 0;
  min-height: 56px;
  caret-color: auto !important;
}

.v-combobox :deep(.v-field__input input) {
  min-width: 50px;
}

.v-combobox :deep(.v-chip.tag-chip) {
  border-radius: 50px;
  padding: 0 16px;
  height: 32px;
  font-weight: 500;
  text-transform: lowercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 2px;
}

.v-combobox :deep(.v-chip.tag-chip .v-chip__close) {
  opacity: 0.7;
  margin-left: 4px;
}

.v-combobox :deep(.v-chip.tag-chip .v-chip__close:hover) {
  opacity: 1;
}
</style> 