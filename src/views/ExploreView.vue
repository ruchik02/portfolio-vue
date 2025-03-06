<template>
  <v-container>
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">Explore Projects</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Discover amazing projects from our community</p>
      </v-col>
    </v-row>

    <!-- Search and Filter Section with Enhanced UI -->
    <v-card class="mb-6" elevation="2">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search projects"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="handleSearch"
              clearable
              class="search-field"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-combobox
              v-model="selectedTags"
              :items="availableTagsWithCount"
              label="Filter by tags"
              multiple
              chips
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              :menu-props="{ maxHeight: 400 }"
              class="tag-filter"
              placeholder="Enter to add new tag"
            >
              <template v-slot:selection="{ item, index }">
                <v-chip
                  v-if="index < 3"
                  :key="index"
                  size="small"
                  closable
                  color="primary"
                  variant="tonal"
                  @click:close="removeTag(item.raw || item)"
                >
                  {{ item.title || item }}
                </v-chip>
                <span
                  v-if="index === 3"
                  class="text-caption grey--text text--darken-1 mx-2"
                >
                  (+{{ selectedTags.length - 3 }} more)
                </span>
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw ? `${item.raw} (${item.count})` : item.title"
                ></v-list-item>
              </template>
            </v-combobox>
          </v-col>
        </v-row>

        <!-- Advanced Filters -->
        <v-expand-transition>
          <v-row v-show="showAdvancedFilters" class="mt-4">
            <v-col cols="12" md="4">
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                label="Sort by"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="handleSearch"
              ></v-select>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-select
                v-model="timeFilter"
                :items="timeFilterOptions"
                label="Time period"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="handleSearch"
              ></v-select>
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="projectType"
                :items="projectTypeOptions"
                label="Project type"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:model-value="handleSearch"
              ></v-select>
            </v-col>
          </v-row>
        </v-expand-transition>

        <!-- Toggle Advanced Filters -->
        <v-btn
          variant="text"
          class="mt-4"
          @click="showAdvancedFilters = !showAdvancedFilters"
          size="small"
        >
          {{ showAdvancedFilters ? 'Less filters' : 'More filters' }}
          <v-icon>{{ showAdvancedFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Active Filters Display -->
    <v-row v-if="hasActiveFilters" class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center flex-wrap">
          <span class="text-body-2 mr-2">Active filters:</span>
          <v-chip
            v-for="tag in selectedTags"
            :key="tag"
            closable
            class="mr-2 mb-2"
            @click:close="removeTag(tag)"
          >
            {{ tag }}
          </v-chip>
          <v-chip
            v-if="search"
            closable
            class="mr-2 mb-2"
            @click:close="search = ''"
          >
            Search: {{ search }}
          </v-chip>
          <v-btn
            v-if="hasActiveFilters"
            variant="text"
            density="comfortable"
            @click="clearFilters"
            size="small"
          >
            Clear all filters
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Projects Grid with Skeleton Loading -->
    <v-row v-if="loading">
      <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
        <v-card class="project-card" elevation="2">
          <v-skeleton-loader
            type="image, article"
            height="200"
          ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

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
        <v-card class="text-center pa-6" elevation="0">
          <v-img
            src="/no-results.svg"
            height="200"
            contain
            class="mb-4"
          ></v-img>
          <h3 class="text-h6 mb-2">No Projects Found</h3>
          <p class="text-body-1 text-medium-emphasis mb-4">
            {{ getNoResultsMessage }}
          </p>
          <v-btn
            color="primary"
            variant="outlined"
            @click="clearFilters"
            v-if="hasActiveFilters"
          >
            Clear All Filters
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Load More Button -->
    <div v-if="hasMoreProjects && filteredProjects.length >= 3" class="text-center mt-6">
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
      searchTimeout: null,
      showAdvancedFilters: false,
      sortBy: 'newest',
      timeFilter: 'all',
      projectType: 'all',
      sortOptions: [
        { title: 'Newest first', value: 'newest' },
        { title: 'Most liked', value: 'likes' },
        { title: 'Most viewed', value: 'views' },
        { title: 'Alphabetical', value: 'alpha' }
      ],
      timeFilterOptions: [
        { title: 'All time', value: 'all' },
        { title: 'This week', value: 'week' },
        { title: 'This month', value: 'month' },
        { title: 'This year', value: 'year' }
      ],
      projectTypeOptions: [
        { title: 'All types', value: 'all' },
        { title: 'Web Development', value: 'web' },
        { title: 'Mobile Apps', value: 'mobile' },
        { title: 'UI/UX Design', value: 'design' }
      ]
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
    },
    hasActiveFilters() {
      return this.selectedTags.length > 0 || this.search || 
             this.sortBy !== 'newest' || this.timeFilter !== 'all' || 
             this.projectType !== 'all'
    },
    getNoResultsMessage() {
      if (this.search && this.selectedTags.length > 0) {
        return `No projects found matching "${this.search}" with selected tags: ${this.selectedTags.join(', ')}`
      } else if (this.search) {
        return `No projects found matching "${this.search}"`
      } else if (this.selectedTags.length > 0) {
        return `No projects found with tags: ${this.selectedTags.join(', ')}`
      }
      return 'No projects found matching your search criteria'
    },
    availableTagsWithCount() {
      // Create a map of tag counts
      const tagCount = {}
      this.projects.forEach(project => {
        project.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      })

      // Convert to array of objects with count
      return this.availableTags.map(tag => ({
        title: `${tag} (${tagCount[tag] || 0})`,
        value: tag
      }))
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
          search: this.search,
          limit: 3
        })
        this.projects = result.projects
        this.lastVisible = result.lastVisible
        this.hasMoreProjects = result.hasMore && result.projects.length >= 3
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
          search: this.search,
          limit: 3
        })
        this.projects.push(...result.projects)
        this.lastVisible = result.lastVisible
        this.hasMoreProjects = result.hasMore && result.projects.length >= 3
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
    },
    clearFilters() {
      this.selectedTags = []
      this.search = ''
      this.sortBy = 'newest'
      this.timeFilter = 'all'
      this.projectType = 'all'
      this.handleSearch()
    },
    removeTag(tag) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag)
      this.handleSearch()
    },
    handleTagSelection(tags) {
      // Remove any empty or invalid tags
      this.selectedTags = tags.filter(tag => tag && typeof tag === 'string')
      this.handleSearch()
    }
  },
  async created() {
    await this.loadProjects()
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.project-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
}

.project-card:hover {
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

.v-skeleton-loader {
  border-radius: 12px 12px 0 0;
}

/* Transitions for expand/collapse */
.v-expand-transition-enter-active,
.v-expand-transition-leave-active {
  transition: all 0.3s ease-in-out;
}

.v-expand-transition-enter-from,
.v-expand-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.search-field :deep(.v-field__input),
.tag-filter :deep(.v-field__input) {
  min-height: 44px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.search-field :deep(.v-field),
.tag-filter :deep(.v-field) {
  height: 44px !important;
}

.tag-filter :deep(.v-field__field) {
  height: auto !important;
  min-height: 44px !important;
}

.tag-filter :deep(.v-chip) {
  margin: 2px;
}

.no-results-card {
  background-color: transparent;
  border: 2px dashed rgba(0, 0, 0, 0.12);
}
</style> 