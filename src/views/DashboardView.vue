<template>
  <v-container>
    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-center align-center" style="height: 200px;">
      <v-progress-circular
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>

    <template v-else>
      <!-- Welcome Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card class="welcome-card" elevation="2">
            <v-row align="center" no-gutters>
              <v-col cols="12" sm="8" class="pa-6">
                <div class="d-flex align-center">
                  <v-avatar size="64" color="primary" class="mr-4">
                    <v-img
                      v-if="currentUser?.photoURL"
                      :src="currentUser.photoURL"
                      alt="Profile"
                    ></v-img>
                    <span v-else class="text-h4 text-white">
                      {{ currentUser?.name?.[0]?.toUpperCase() || '' }}
                    </span>
                  </v-avatar>
                  <div>
                    <h2 class="text-h4 font-weight-bold mb-1">
                      Welcome back, {{ currentUser?.name || 'Creator' }}!
                    </h2>
                    <p class="text-subtitle-1 text-medium-emphasis mb-0">
                      Here's what's happening with your projects
                    </p>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="4" class="pa-6 text-sm-end">
                <v-btn
                  color="primary"
                  size="large"
                  prepend-icon="mdi-plus"
                  to="/create"
                  elevation="2"
                >
                  New Project
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Search and Filter Section -->
      <v-row class="mb-6">
        <v-col cols="12" sm="8" md="6">
          <v-text-field
            v-model="search"
            label="Search projects"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
            class="search-field"
            placeholder="Search by title, description, or tags"
            @input="handleSearch"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="4" md="3">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            label="Sort by"
            variant="outlined"
            density="comfortable"
            hide-details
            @update:modelValue="handleSearch"
          ></v-select>
        </v-col>
      </v-row>

      <!-- Stats Cards -->
      <v-row class="mb-6">
        <v-col cols="12" md="4">
          <v-card class="stat-card" elevation="2">
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="text-overline font-weight-bold">TOTAL PROJECTS</div>
                <v-icon color="primary" size="32">mdi-folder-multiple</v-icon>
              </div>
              <div class="text-h3 font-weight-bold mb-2">{{ stats.totalProjects || 0 }}</div>
              <v-progress-linear
                :model-value="stats.projectsProgress || 0"
                color="primary"
                height="8"
                rounded
              ></v-progress-linear>
              <div class="d-flex align-center mt-2">
                <template v-if="stats.projectsIncrease !== null">
                  <v-icon 
                    :color="stats.projectsIncrease >= 0 ? 'primary' : 'error'" 
                    size="small" 
                    class="mr-1"
                  >
                    {{ stats.projectsIncrease >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                  </v-icon>
                  <span 
                    class="text-caption"
                    :class="stats.projectsIncrease >= 0 ? 'text-primary' : 'text-error'"
                  >
                    {{ Math.abs(stats.projectsIncrease) }}% {{ stats.projectsIncrease >= 0 ? 'increase' : 'decrease' }}
                  </span>
                </template>
                <template v-else>
                  <span class="text-caption text-medium-emphasis">No previous data</span>
                </template>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="stat-card" elevation="2">
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="text-overline font-weight-bold">TOTAL VIEWS</div>
                <v-icon color="success" size="32">mdi-eye</v-icon>
              </div>
              <div class="text-h3 font-weight-bold mb-2">{{ stats.totalViews || 0 }}</div>
              <v-progress-linear
                :model-value="stats.viewsProgress || 0"
                color="success"
                height="8"
                rounded
              ></v-progress-linear>
              <div class="d-flex align-center mt-2">
                <template v-if="stats.viewsIncrease !== null">
                  <v-icon 
                    :color="stats.viewsIncrease >= 0 ? 'success' : 'error'" 
                    size="small" 
                    class="mr-1"
                  >
                    {{ stats.viewsIncrease >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                  </v-icon>
                  <span 
                    class="text-caption"
                    :class="stats.viewsIncrease >= 0 ? 'text-success' : 'text-error'"
                  >
                    {{ Math.abs(stats.viewsIncrease) }}% {{ stats.viewsIncrease >= 0 ? 'increase' : 'decrease' }}
                  </span>
                </template>
                <template v-else>
                  <span class="text-caption text-medium-emphasis">No previous data</span>
                </template>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="stat-card" elevation="2">
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="text-overline font-weight-bold">TOTAL LIKES</div>
                <v-icon color="error" size="32">mdi-heart</v-icon>
              </div>
              <div class="text-h3 font-weight-bold mb-2">{{ stats.totalLikes || 0 }}</div>
              <v-progress-linear
                :model-value="stats.likesProgress || 0"
                color="error"
                height="8"
                rounded
              ></v-progress-linear>
              <div class="d-flex align-center mt-2">
                <template v-if="stats.likesIncrease !== null">
                  <v-icon 
                    :color="stats.likesIncrease >= 0 ? 'error' : 'error'" 
                    size="small" 
                    class="mr-1"
                  >
                    {{ stats.likesIncrease >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                  </v-icon>
                  <span 
                    class="text-caption"
                    :class="stats.likesIncrease >= 0 ? 'text-error' : 'text-error'"
                  >
                    {{ Math.abs(stats.likesIncrease) }}% {{ stats.likesIncrease >= 0 ? 'increase' : 'decrease' }}
                  </span>
                </template>
                <template v-else>
                  <span class="text-caption text-medium-emphasis">No previous data</span>
                </template>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Projects -->
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h5 font-weight-bold mb-0">Recent Projects</h3>
            <v-btn
              variant="text"
              color="primary"
              to="/projects"
              prepend-icon="mdi-chevron-right"
            >
              View All
            </v-btn>
          </div>
          
          <!-- No Projects State -->
          <v-card
            v-if="!filteredProjects.length"
            class="empty-state pa-8 text-center"
            elevation="0"
            border
          >
            <v-icon
              icon="mdi-folder-open-outline"
              size="64"
              color="grey-lighten-1"
              class="mb-4"
            ></v-icon>
            <h3 class="text-h6 mb-2">No Projects Found</h3>
          </v-card>

          <!-- Projects Grid -->
          <v-row v-else>
            <v-col 
              v-for="project in filteredProjects" 
              :key="project.id" 
              cols="12" 
              sm="6" 
              md="4"
            >
              <v-card class="project-card" elevation="2">
                <v-img
                  :src="project.thumbnail"
                  height="200"
                  cover
                  class="project-image"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular
                        indeterminate
                        color="primary"
                      ></v-progress-circular>
                    </div>
                  </template>
                </v-img>
                
                <v-card-title class="text-h6 font-weight-bold pt-4">
                  {{ project.title }}
                </v-card-title>
                
                <v-card-subtitle class="pb-0">
                  {{ formatDate(project.createdAt) }}
                </v-card-subtitle>
                
                <v-card-text>
                  <p class="text-body-2 mb-4 text-medium-emphasis">
                    {{ truncateText(project.description, 120) }}
                  </p>
                  <v-chip-group>
                    <v-chip
                      v-for="tag in project.tags"
                      :key="tag"
                      size="small"
                      variant="outlined"
                      class="mr-1"
                    >
                      {{ tag }}
                    </v-chip>
                  </v-chip-group>
                </v-card-text>
                
                <v-divider></v-divider>
                
                <v-card-actions>
                  <v-btn
                    variant="text"
                    color="primary"
                    :to="`/project/${project.id}`"
                  >
                    View Project
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    icon
                    variant="text"
                    :color="project.isLiked ? 'error' : undefined"
                    @click.stop="toggleLike(project)"
                    :loading="likeLoadingMap[project.id]"
                  >
                    <v-icon>
                      {{ project.isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}
                    </v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                    >
                      {{ project.isLiked ? 'Unlike' : 'Like' }} project
                    </v-tooltip>
                  </v-btn>
                  <span class="mr-4">{{ project.likes?.length || 0 }}</span>
                  <v-btn 
                    icon 
                    variant="text"
                    @click="shareProject(project)"
                  >
                    <v-icon>mdi-share-variant-outline</v-icon>
                    <v-tooltip
                      activator="parent"
                      location="top"
                    >
                      Share project
                    </v-tooltip>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>

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
  </v-container>
</template>

<style scoped>
.welcome-card {
  border-radius: 16px;
}

.stat-card {
  border-radius: 16px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.project-card {
  border-radius: 16px;
  transition: transform 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-4px);
}

.project-image {
  border-radius: 16px 16px 0 0;
}

.v-card-title {
  line-height: 1.4;
}

.v-progress-linear {
  border-radius: 4px;
}

.v-card-text {
  flex-grow: 1;
}

.share-dialog {
  border-radius: 16px;
}

.share-dialog :deep(.v-btn) {
  text-transform: none;
  border-radius: 8px;
  font-weight: 500;
}

.share-dialog :deep(.rounded-t) {
  border-radius: 8px 8px 0 0 !important;
}

.share-dialog :deep(.rounded-b) {
  border-radius: 0 0 8px 8px !important;
}

.share-dialog :deep(.v-text-field) {
  border-radius: 8px;
}

.share-dialog :deep(.v-field) {
  border-radius: 8px;
}

.v-text-field :deep(.v-field__append-inner) {
  cursor: pointer;
}

.v-text-field.success--text :deep(.v-field__append-inner),
.v-text-field.success--text :deep(.v-field-label),
.v-text-field.success--text :deep(.v-field__hint) {
  color: rgb(var(--v-theme-success)) !important;
}

.search-field {
  max-width: 100%;
}

/* Add these styles to both components for consistency */
:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-text-field .v-input__details) {
  display: none;
}

:deep(.v-field__input) {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  min-height: 44px;
}

:deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}

.v-btn.v-btn--loading {
  pointer-events: none;
}

.empty-state {
  border-radius: 16px;
  background-color: rgb(var(--v-theme-surface));
}
</style>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'DashboardView',
  data() {
    return {
      isLoading: true,
      search: '',
      sortBy: 'newest',
      sortOptions: [
        { title: 'Newest First', value: 'newest' },
        { title: 'Oldest First', value: 'oldest' },
        { title: 'Most Liked', value: 'likes' },
        { title: 'Most Viewed', value: 'views' }
      ],
      recentProjects: [],
      filteredProjects: [],
      stats: {
        totalProjects: 0,
        totalViews: 0,
        totalLikes: 0,
        projectsIncrease: null,
        viewsIncrease: null,
        likesIncrease: null,
        projectsProgress: 0,
        viewsProgress: 0,
        likesProgress: 0
      },
      likeLoadingMap: {},
      shareDialog: false,
      shareUrl: '',
      copied: false
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/currentUser',
      isAuthenticated: 'auth/isAuthenticated',
      authLoading: 'auth/loading'
    })
  },
  methods: {
    ...mapActions({
      fetchRecentProjects: 'projects/fetchRecentProjects',
      fetchUserStats: 'projects/fetchUserStats',
      toggleProjectLike: 'projects/toggleLike',
      fetchProject: 'projects/fetchProject'
    }),

    setLikeLoading(projectId, loading) {
      this.likeLoadingMap = {
        ...this.likeLoadingMap,
        [projectId]: loading
      }
    },

    async toggleLike(project) {
      if (this.likeLoadingMap[project.id]) return
      
      this.setLikeLoading(project.id, true)
      
      try {
        const updatedProject = await this.toggleProjectLike(project)
        
        // Update the project in both arrays
        const updateProject = (arr) => {
          const index = arr.findIndex(p => p.id === project.id)
          if (index !== -1) {
            // Update all relevant project properties
            arr[index] = {
              ...arr[index],
              likes: updatedProject.likes,
              isLiked: updatedProject.isLiked,
              likesCount: updatedProject.likes?.length || 0
            }
          }
        }
        
        updateProject(this.recentProjects)
        updateProject(this.filteredProjects)
        
        // Update stats immediately
        this.stats.totalLikes = (this.stats.totalLikes || 0) + (updatedProject.isLiked ? 1 : -1)
        
        // Fetch fresh stats from server
        const newStats = await this.fetchUserStats()
        this.stats = { ...this.stats, ...newStats }
      } catch (error) {
        console.error('Error toggling like:', error)
        if (this.$toast) {
          this.$toast.error('Failed to update like')
        }
      } finally {
        this.setLikeLoading(project.id, false)
      }
    },

    handleSearch() {
      if (!this.recentProjects) return

      let filtered = [...this.recentProjects]

      // Apply search filter
      if (this.search) {
        const searchLower = this.search.toLowerCase()
        filtered = filtered.filter(project => 
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        )
      }

      // Apply sorting
      switch (this.sortBy) {
        case 'oldest':
          filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          break
        case 'likes':
          filtered.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
          break
        case 'views':
          filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
          break
        default: // newest
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }

      this.filteredProjects = filtered
    },

    async loadDashboardData() {
      if (this.authLoading) return
      
      try {
        if (!this.isAuthenticated) {
          await this.$router.push('/auth')
          return
        }

        this.isLoading = true
        this.recentProjects = await this.fetchRecentProjects()
        this.stats = await this.fetchUserStats()
        
        // Initialize like loading map
        this.likeLoadingMap = this.recentProjects.reduce((acc, project) => {
          acc[project.id] = false
          return acc
        }, {})
        
        this.handleSearch() // Initialize filtered projects
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        this.isLoading = false
      }
    },

    shareProject(project) {
      if (!project) return
      
      const url = `${window.location.origin}/project/${project.id}`
      this.shareUrl = url
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
      }
    },

    shareToSocial(platform) {
      if (!this.shareUrl) return

      const url = encodeURIComponent(this.shareUrl)
      const title = encodeURIComponent('Check out this project!')
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

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length 
        ? text.substring(0, length) + '...' 
        : text;
    }
  },
  async created() {
    await this.loadDashboardData()
  },
  watch: {
    search() {
      this.handleSearch()
    },
    sortBy() {
      this.handleSearch()
    }
  }
}
</script> 