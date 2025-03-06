<template>
  <v-container v-if="project">
    <!-- Project Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card>
          <v-img
            :src="project.thumbnail || '/default-project.jpg'"
            height="300"
            cover
            class="align-end"
          >
            <template v-slot:placeholder>
              <v-row
                class="fill-height ma-0"
                align="center"
                justify="center"
              >
                <v-progress-circular
                  indeterminate
                  color="grey-lighten-5"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>

          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <h1 class="text-h4 font-weight-bold">{{ project.title }}</h1>
              
              <div class="d-flex align-center">
                <!-- Like Button -->
                <v-btn
                  icon
                  variant="text"
                  :color="isLiked ? 'error' : undefined"
                  :loading="likeLoading"
                  @click="handleLike"
                >
                  <v-icon>{{ isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                  >
                    {{ isLiked ? 'Unlike' : 'Like' }} project
                  </v-tooltip>
                </v-btn>
                <span class="mr-4">{{ project.likes?.length || 0 }}</span>

                <!-- Share Button -->
                <v-btn
                  icon
                  variant="text"
                  @click="shareProject"
                >
                  <v-icon>mdi-share-variant</v-icon>
                </v-btn>

                <!-- Project Actions Menu (for owner) -->
                <v-menu v-if="isOwner">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      variant="text"
                      v-bind="props"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-item
                      @click="$router.push(`/project/${project.id}/edit`)"
                    >
                      <template v-slot:prepend>
                        <v-icon>mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>Edit Project</v-list-item-title>
                    </v-list-item>

                    <v-list-item
                      @click="confirmDelete"
                      color="error"
                    >
                      <template v-slot:prepend>
                        <v-icon color="error">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title>Delete Project</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>

            <!-- Tags -->
            <v-chip-group class="mt-4">
              <v-chip
                v-for="tag in project.tags"
                :key="tag"
                color="primary"
                variant="tonal"
                size="small"
                class="mr-1"
              >
                {{ tag }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Project Content -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <div class="text-body-1">{{ project.description }}</div>
          </v-card-text>
        </v-card>

        <!-- Comments Section -->
        <v-card class="mt-6">
          <v-card-title class="d-flex align-center">
            Comments
            <v-chip class="ml-2" size="small">{{ project?.comments?.length || 0 }}</v-chip>
          </v-card-title>
          
          <v-card-text>
            <!-- Comment Form -->
            <v-form @submit.prevent="handleAddComment" v-if="isAuthenticated">
              <v-textarea
                v-model="newComment"
                label="Add a comment"
                rows="3"
                variant="outlined"
                :rules="commentRules"
                :loading="commentLoading"
                :disabled="commentLoading"
                hide-details="auto"
                class="mb-3"
              ></v-textarea>
              <v-btn
                color="primary"
                type="submit"
                :disabled="!newComment.trim() || commentLoading"
                :loading="commentLoading"
              >
                Post Comment
              </v-btn>
            </v-form>

            <v-alert
              v-else
              type="info"
              variant="tonal"
              class="mt-4"
            >
              Please <v-btn variant="text" color="primary" @click="$router.push('/login')">login</v-btn> to comment
            </v-alert>

            <!-- Comments List -->
            <v-list class="mt-4">
              <template v-if="project?.comments?.length">
                <v-list-item
                  v-for="comment in sortedComments"
                  :key="comment.id"
                  class="comment-item"
                >
                  <div class="d-flex align-center justify-space-between w-100">
                    <div class="d-flex align-center">
                      <v-avatar size="40" color="primary" class="mr-4">
                        <v-img
                          v-if="comment.userPhotoURL"
                          :src="comment.userPhotoURL"
                          alt="User"
                        ></v-img>
                        <span v-else class="text-h6 text-white">
                          {{ getInitials(comment.userName) }}
                        </span>
                      </v-avatar>
                      
                      <div>
                        <div class="d-flex align-center">
                          <span class="font-weight-medium">{{ comment.userName }}</span>
                          <span class="text-caption text-grey-darken-1 ml-2">
                            {{ formatDate(comment.createdAt) }}
                          </span>
                        </div>
                        <div class="text-body-1 mt-2">{{ comment.text }}</div>
                      </div>
                    </div>

                    <!-- Updated Delete Button -->
                    <v-menu v-if="currentUser && (comment.userId === currentUser.uid || project.userId === currentUser.uid)">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          icon
                          variant="text"
                          v-bind="props"
                          size="small"
                        >
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>

                      <v-list>
                        <v-list-item
                          @click="confirmDeleteComment(comment)"
                          color="error"
                        >
                          <template v-slot:prepend>
                            <v-icon color="error">mdi-delete</v-icon>
                          </template>
                          <v-list-item-title>Delete Comment</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </v-list-item>
              </template>
              <v-list-item v-else>
                <v-list-item-title class="text-center text-grey">
                  No comments yet. Be the first to comment!
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Project Stats -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Project Stats</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-eye</v-icon>
                </template>
                <v-list-item-title>{{ project.views || 0 }} Views</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon :color="isLiked ? 'error' : undefined">mdi-heart</v-icon>
                </template>
                <v-list-item-title>{{ project.likes?.length || 0 }} Likes</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-comment</v-icon>
                </template>
                <v-list-item-title>
                  {{ project.comments?.length || 0 }} Comments
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Project Owner -->
        <v-card class="mt-4">
          <v-card-title>Created By</v-card-title>
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="40" color="grey-lighten-1" class="mr-4">
                <v-img
                  v-if="project.userPhotoURL"
                  :src="project.userPhotoURL"
                  alt="Creator"
                ></v-img>
                <span v-else class="text-h6 text-white">
                  {{ currentUser?.name  }}
                </span>
              </v-avatar>
              <div>
                <div class="text-body-1">{{ currentUser?.name }}</div>
                <div class="text-caption text-grey-darken-1">
                  {{ formatDate(project.createdAt) }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">Delete Project</v-card-title>
        <v-card-text>
          Are you sure you want to delete this project? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="deleteProject"
            :loading="deleteLoading"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Share Dialog -->
    <v-dialog v-model="shareDialog" max-width="500">
      <v-card class="share-dialog">
        <v-card-title class="text-h5 font-weight-bold pa-4">
          Share Project
        </v-card-title>
        
        <v-card-text class="pa-4">
          <div class="position-relative">
            <v-text-field
              v-model="shareUrl"
              label="Project URL"
              readonly
              variant="outlined"
              class="mb-6"
              bg-color="grey-lighten-4"
              :append-inner-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
              @click:append-inner="copyToClipboard"
              persistent-hint
              :hint="copied ? 'Copied!' : ''"
              :class="{ 'success--text': copied }"
            ></v-text-field>
          </div>

          <div class="d-flex flex-column gap-4">
            <v-btn
              block
              color="#1DA1F2"
              class="text-none mb-2"
              height="48"
              @click="shareToSocial('twitter')"
            >
              <v-icon start icon="mdi-twitter" class="mr-2"></v-icon>
              Share on Twitter
            </v-btn>
            
            <v-btn
              block
              color="#0077B5"
              class="text-none mb-2"
              height="48"
              @click="shareToSocial('linkedin')"
            >
              <v-icon start icon="mdi-linkedin" class="mr-2"></v-icon>
              Share on LinkedIn
            </v-btn>
            
            <v-btn
              block
              color="#4267B2"
              class="text-none mb-2"
              height="48"
              @click="shareToSocial('facebook')"
            >
              <v-icon start icon="mdi-facebook" class="mr-2"></v-icon>
              Share on Facebook
            </v-btn>
          </div>
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="shareDialog = false"
            class="text-none"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Comment Dialog -->
    <v-dialog v-model="showDeleteCommentDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">Delete Comment</v-card-title>
        <v-card-text>
          Are you sure you want to delete this comment? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showDeleteCommentDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="deleteComment"
            :loading="deleteCommentLoading"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>

  <!-- Loading State -->
  <v-container v-else-if="loading">
    <v-row justify="center" align="center" style="height: 400px">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </v-col>
    </v-row>
  </v-container>

  <!-- Error State -->
  <v-container v-else>
    <v-row justify="center" align="center" style="height: 400px">
      <v-col cols="12" class="text-center">
        <v-icon
          size="64"
          color="grey-lighten-1"
          class="mb-4"
        >
          mdi-alert-circle
        </v-icon>
        <h3 class="text-h6 text-grey-darken-1">Project not found</h3>
        <v-btn
          color="primary"
          class="mt-4"
          to="/projects"
        >
          Back to Projects
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ProjectDetailsView',
  data() {
    return {
      loading: true,
      likeLoading: false,
      commentLoading: false,
      deleteLoading: false,
      showDeleteDialog: false,
      shareDialog: false,
      shareUrl: '',
      copied: false,
      newComment: '',
      projectData: null,
      commentRules: [
        v => v.length <= 500 || 'Comment must be less than 500 characters'
      ],
      showDeleteCommentDialog: false,
      deleteCommentLoading: false,
      commentToDelete: null
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/currentUser',
      isAuthenticated: 'auth/isAuthenticated'
    }),
    project() {
      return this.projectData
    },
    isOwner() {
      return this.project?.userId === this.currentUser?.uid
    },
    isLiked() {
      return this.project?.likes?.includes(this.currentUser?.uid) || false
    },
    sortedComments() {
      return [...(this.project?.comments || [])].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
    }
  },
  methods: {
    ...mapActions({
      fetchProject: 'projects/fetchProject',
      toggleLike: 'projects/toggleLike',
      addProjectComment: 'projects/addComment',
      removeProject: 'projects/deleteProject',
      fetchProjects: 'projects/fetchProjects',
      addComment: 'projects/addComment',
      removeComment: 'projects/removeComment'
    }),
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    async loadProject() {
      try {
        this.loading = true
        const projectId = this.$route.params.id
        const projectData = await this.fetchProject(projectId)
        this.projectData = {
          ...projectData,
          likes: projectData.likes || []
        }
      } catch (error) {
        console.error('Error loading project:', error)
      } finally {
        this.loading = false
      }
    },
    async handleLike() {
      if (!this.isAuthenticated) {
        // Redirect to login or show login dialog
        this.$router.push('/login')
        return
      }

      if (this.likeLoading) return

      this.likeLoading = true
      try {
        await this.toggleLike(this.project)
        // Update local project data with new likes
        const updatedProject = await this.fetchProject(this.project.id)
        this.projectData = {
          ...updatedProject,
          likes: updatedProject.likes || []
        }
      } catch (error) {
        console.error('Error toggling like:', error)
        if (this.$toast) {
          this.$toast.error('Failed to update like')
        }
      } finally {
        this.likeLoading = false
      }
    },
    async handleAddComment() {
      if (!this.newComment.trim() || this.commentLoading) return

      this.commentLoading = true
      try {
        await this.addComment({
          projectId: this.project.id,
          text: this.newComment.trim()
        })
        
        // Refresh project data to get updated comments
        await this.loadProject()
        this.newComment = ''
        
        if (this.$toast) {
          this.$toast.success('Comment added successfully')
        }
      } catch (error) {
        console.error('Error adding comment:', error)
        if (this.$toast) {
          this.$toast.error('Failed to add comment')
        }
      } finally {
        this.commentLoading = false
      }
    },
    shareProject() {
      this.shareUrl = window.location.href
      this.shareDialog = true
    },
    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.shareUrl)
        this.copied = true
        setTimeout(() => {
          this.copied = false
        }, 2000)
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        this.$toast?.error('Failed to copy URL')
      }
    },
    shareToSocial(platform) {
      if (!this.project) return

      const url = encodeURIComponent(this.shareUrl)
      const title = encodeURIComponent(this.project.title)
      let shareUrl = ''

      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`
          break
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
          break
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
          break
        default:
          return
      }

      window.open(shareUrl, '_blank', 'width=600,height=400')
    },
    editProject() {
      this.$router.push(`/project/${this.project.id}/edit`)
    },
    confirmDelete() {
      this.showDeleteDialog = true
    },
    async deleteProject() {
      this.deleteLoading = true
      try {
        const deleteData = {
          id: this.project.id,
          thumbnailPath: this.project.thumbnail || null
        }
        
        await this.removeProject(deleteData)
        await this.fetchProjects()
        this.$router.push('/projects')
        
        if (this.$toast) {
          this.$toast.success('Project deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting project:', error)
        if (this.$toast) {
          this.$toast.error('Failed to delete project')
        }
      } finally {
        this.deleteLoading = false
        this.showDeleteDialog = false
      }
    },
    confirmDeleteComment(comment) {
      this.commentToDelete = comment
      this.showDeleteCommentDialog = true
    },
    async deleteComment() {
      if (!this.commentToDelete) return

      this.deleteCommentLoading = true
      try {
        await this.removeComment({
          projectId: this.project.id,
          commentId: this.commentToDelete.id
        })
        
        // Refresh project data
        await this.loadProject()
        
        if (this.$toast) {
          this.$toast.success('Comment deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting comment:', error)
        if (this.$toast) {
          this.$toast.error('Failed to delete comment')
        }
      } finally {
        this.deleteCommentLoading = false
        this.showDeleteCommentDialog = false
        this.commentToDelete = null
      }
    },
    getInitials(name) {
      if (!name) return ''
      const parts = name.split(' ')
      return parts.map(part => part.charAt(0).toUpperCase()).join('')
    }
  },
  async created() {
    await this.loadProject()
  },
  watch: {
    '$route.params.id': {
      handler: 'loadProject',
      immediate: true
    }
  }
}
</script>

<style scoped>
.share-dialog {
  border-radius: 16px;
}

.share-dialog :deep(.v-btn) {
  text-transform: none;
  border-radius: 8px;
  font-weight: 500;
}

.v-text-field :deep(.v-field__append-inner) {
  cursor: pointer;
}

.v-text-field.success--text :deep(.v-field__append-inner),
.v-text-field.success--text :deep(.v-field-label),
.v-text-field.success--text :deep(.v-field__hint) {
  color: rgb(var(--v-theme-success)) !important;
}

.v-btn {
  margin-left: 4px;
}

.v-menu {
  display: inline-block;
}

.v-btn.v-btn--icon {
  transition: transform 0.2s ease;
}

.v-btn.v-btn--icon:active {
  transform: scale(1.2);
}

.v-icon {
  transition: color 0.2s ease;
}

.v-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.v-list-item:last-child {
  border-bottom: none;
}

.comment-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 16px;
}

.comment-item:last-child {
  border-bottom: none;
}

.w-100 {
  width: 100%;
}
</style> 