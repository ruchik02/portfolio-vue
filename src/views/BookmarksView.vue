<template>
  <v-container>
    <!-- Header Section -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 mb-1">Bookmarks</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Your saved projects
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
        <v-card>
          <v-skeleton-loader
            type="image, article"
            height="300"
          ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bookmarks Grid -->
    <template v-else>
      <v-row v-if="bookmarks && bookmarks.length">
        <v-col
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card class="bookmark-card">
            <!-- Project Thumbnail -->
            <v-img
              :src="bookmark.thumbnail || '/default-project.jpg'"
              height="200"
              cover
              class="project-image"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                </div>
              </template>
            </v-img>

            <v-card-text class="pa-4">
              <!-- Project Title -->
              <div class="d-flex align-center justify-space-between mb-2">
                <h3 class="text-h6 font-weight-bold text-truncate">
                  {{ bookmark.title }}
                </h3>
                <v-btn
                  icon="mdi-bookmark-remove"
                  variant="text"
                  color="error"
                  size="small"
                  @click="handleRemoveBookmark(bookmark)"
                >
                  <v-tooltip activator="parent" location="top">
                    Remove bookmark
                  </v-tooltip>
                </v-btn>
              </div>

              <!-- Creator Info -->
              <div class="d-flex align-center mb-3">
                <v-avatar size="24" color="primary" class="mr-2">
                  <span class="text-caption">
                    {{ bookmark.creatorName?.[0]?.toUpperCase() || 'U' }}
                  </span>
                </v-avatar>
                <span class="text-body-2">{{ bookmark.creatorName }}</span>
              </div>

              <!-- Project Description -->
              <p class="text-body-2 text-medium-emphasis mb-3 project-description">
                {{ bookmark.description }}
              </p>

              <!-- Bookmark Date -->
              <div class="text-caption text-medium-emphasis mb-3">
                Bookmarked {{ formatDate(bookmark.createdAt) }}
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <!-- Card Actions -->
            <v-card-actions class="pa-4">
              <v-btn
                variant="tonal"
                color="primary"
                :to="`/project/${bookmark.projectId}`"
                block
                prepend-icon="mdi-open-in-new"
              >
                View Project
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-card
        v-else
        class="text-center pa-8"
        variant="outlined"
      >
        <v-icon
          icon="mdi-bookmark-outline"
          size="64"
          color="grey-lighten-1"
          class="mb-4"
        ></v-icon>
        <h3 class="text-h6 text-grey-darken-1 mb-2">No bookmarks yet</h3>
        <p class="text-body-2 text-grey mb-4">
          Start bookmarking projects you're interested in to find them easily later
        </p>
        <v-btn
          color="primary"
          to="/explore"
          prepend-icon="mdi-compass"
        >
          Explore Projects
        </v-btn>
      </v-card>
    </template>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">Remove Bookmark</v-card-title>
        <v-card-text>
          Are you sure you want to remove this bookmark?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showConfirmDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="confirmRemoveBookmark"
            :loading="removing"
          >
            Remove
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'BookmarksView',
  data() {
    return {
      showConfirmDialog: false,
      removing: false,
      bookmarkToRemove: null,
      loading: true
    }
  },
  computed: {
    ...mapState({
      bookmarks: state => state.bookmarks?.bookmarks || []
    })
  },
  methods: {
    ...mapActions({
      fetchBookmarks: 'bookmarks/fetchBookmarks',
      removeBookmark: 'bookmarks/removeBookmark'
    }),
    formatDate(date) {
      if (!date) return ''
      
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (days < 1) return 'Today'
      if (days < 2) return 'Yesterday'
      if (days < 7) return `${days} days ago`
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    handleRemoveBookmark(bookmark) {
      this.bookmarkToRemove = bookmark
      this.showConfirmDialog = true
    },
    async confirmRemoveBookmark() {
      if (!this.bookmarkToRemove) return

      this.removing = true
      try {
        await this.removeBookmark(this.bookmarkToRemove.id)
        if (this.$toast) {
          this.$toast.success('Bookmark removed successfully')
        }
      } catch (error) {
        console.error('Error removing bookmark:', error)
        if (this.$toast) {
          this.$toast.error('Failed to remove bookmark')
        }
      } finally {
        this.removing = false
        this.showConfirmDialog = false
        this.bookmarkToRemove = null
      }
    },
    async loadBookmarks() {
      this.loading = true
      try {
        await this.fetchBookmarks()
      } catch (error) {
        console.error('Error loading bookmarks:', error)
        if (this.$toast) {
          this.$toast.error('Failed to load bookmarks')
        }
      } finally {
        this.loading = false
      }
    }
  },
  async created() {
    await this.loadBookmarks()
  }
}
</script>

<style scoped>
.bookmark-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
}

.bookmark-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
}

.project-image {
  border-radius: 12px 12px 0 0;
}

.project-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-card-actions .v-btn {
  text-transform: none;
  letter-spacing: 0;
}
</style> 