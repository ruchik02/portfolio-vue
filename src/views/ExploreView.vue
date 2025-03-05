<template>
  <v-container>
    <!-- Search and Filter Section -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search projects"
          variant="outlined"
          density="comfortable"
          hide-details
          @update:model-value="handleSearch"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedTags"
          :items="availableTags"
          label="Filter by tags"
          multiple
          chips
          variant="outlined"
          density="comfortable"
          hide-details
          @update:model-value="handleSearch"
        ></v-select>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center" style="height: 200px;">
      <v-progress-circular
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>

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
          <!-- Project Thumbnail -->
          <v-img
            :src="project.thumbnail || '/default-project.jpg'"
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
            <!-- Project Header -->
            <div class="d-flex align-center justify-space-between mb-2">
              <h3 class="text-h6 font-weight-bold text-truncate">
                {{ project.title }}
              </h3>
              <v-btn
                icon="mdi-heart"
                :color="project.liked ? 'error' : undefined"
                variant="text"
                density="comfortable"
                @click="toggleLike(project)"
              ></v-btn>
            </div>

            <!-- Creator Info -->
            <div class="d-flex align-center mb-3">
              <v-avatar size="24" color="primary" class="mr-2">
                <v-img
                  v-if="project.creator?.photoURL"
                  :src="project.creator.photoURL"
                  alt="Creator"
                ></v-img>
                <span v-else class="text-caption">
                  {{ project.creator?.name?.[0]?.toUpperCase() || 'U' }}
                </span>
              </v-avatar>
              <span class="text-body-2">{{ project.creator?.name }}</span>
            </div>

            <!-- Project Description -->
            <p class="text-body-2 text-medium-emphasis mb-3 project-description">
              {{ project.description }}
            </p>

            <!-- Project Tags -->
            <div class="mb-3">
              <v-chip
                v-for="tag in project.tags"
                :key="tag"
                size="x-small"
                variant="outlined"
                class="mr-1 mb-1"
              >
                {{ tag }}
              </v-chip>
            </div>

            <!-- Project Stats -->
            <div class="d-flex align-center text-caption text-medium-emphasis">
              <v-icon size="small" class="mr-1">mdi-eye</v-icon>
              <span class="mr-3">{{ project.views || 0 }}</span>
              <v-icon size="small" class="mr-1">mdi-heart</v-icon>
              <span class="mr-3">{{ project.likes || 0 }}</span>
              <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
              <span>{{ formatDate(project.createdAt) }}</span>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <!-- Card Actions -->
          <v-card-actions class="pa-4">
            <v-btn
              variant="tonal"
              color="primary"
              :to="`/project/${project.id}`"
              block
              prepend-icon="mdi-open-in-new"
            >
              View Project
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- No Results Message -->
      <v-col v-if="filteredProjects.length === 0" cols="12">
        <v-alert
          type="info"
          variant="tonal"
          class="text-center"
        >
          No projects found matching your search criteria.
        </v-alert>
      </v-col>
    </v-row>

    <!-- Load More Button -->
    <div v-if="hasMoreProjects" class="text-center mt-6">
      <v-btn
        color="primary"
        variant="outlined"
        :loading="loadingMore"
        @click="loadMore"
      >
        Load More
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ExploreView',
  data() {
    return {
      search: '',
      selectedTags: [],
      projects: [],
      loading: true,
      loadingMore: false,
      lastVisible: null,
      hasMoreProjects: true,
      availableTags: [],
      searchTimeout: null
    }
  },
  computed: {
    filteredProjects() {
      let filtered = [...this.projects]

      // Filter by search term
      if (this.search) {
        const searchLower = this.search.toLowerCase()
        filtered = filtered.filter(project => 
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower)
        )
      }

      // Filter by tags
      if (this.selectedTags.length > 0) {
        filtered = filtered.filter(project =>
          this.selectedTags.some(tag => project.tags.includes(tag))
        )
      }

      return filtered
    }
  },
  methods: {
    ...mapActions({
      fetchExploreProjects: 'projects/fetchExploreProjects',
      likeProject: 'projects/likeProject'
    }),
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    },
    handleSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      this.searchTimeout = setTimeout(() => {
        this.loadProjects()
      }, 300)
    },
    async loadProjects() {
      this.loading = true
      try {
        const result = await this.fetchExploreProjects({
          lastVisible: null,
          tags: this.selectedTags,
          search: this.search
        })
        this.projects = result.projects
        this.lastVisible = result.lastVisible
        this.hasMoreProjects = result.hasMore
        this.availableTags = result.tags
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        this.loading = false
      }
    },
    async loadMore() {
      if (this.loadingMore || !this.hasMoreProjects) return

      this.loadingMore = true
      try {
        const result = await this.fetchExploreProjects({
          lastVisible: this.lastVisible,
          tags: this.selectedTags,
          search: this.search
        })
        this.projects.push(...result.projects)
        this.lastVisible = result.lastVisible
        this.hasMoreProjects = result.hasMore
      } catch (error) {
        console.error('Error loading more projects:', error)
      } finally {
        this.loadingMore = false
      }
    },
    async toggleLike(project) {
      try {
        await this.likeProject(project.id)
        project.liked = !project.liked
        project.likes += project.liked ? 1 : -1
      } catch (error) {
        console.error('Error toggling like:', error)
      }
    }
  },
  async created() {
    await this.loadProjects()
  }
}
</script>

<style scoped>
.project-card {
  border-radius: 16px;
  transition: transform 0.2s;
  height: 100%;
}

.project-card:hover {
  transform: translateY(-4px);
}

.project-image {
  border-radius: 16px 16px 0 0;
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