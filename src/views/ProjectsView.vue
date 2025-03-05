<template>
  <v-container>
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12" sm="8">
        <h2 class="text-h4">My Projects</h2>
      </v-col>
      <v-col cols="12" sm="4" class="text-sm-end">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          to="/create"
        >
          New Project
        </v-btn>
      </v-col>
    </v-row>

    <!-- Search and Filter Row -->
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
          @input="filterProjects"
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
          @update:modelValue="filterProjects"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3" class="d-flex justify-end align-center">
        <v-btn-toggle
          v-model="viewType"
          color="primary"
          rounded="lg"
          density="comfortable"
          mandatory
        >
          <v-btn value="grid">
            <v-icon>mdi-grid</v-icon>
            <v-tooltip activator="parent" location="top">Grid view</v-tooltip>
          </v-btn>
          <v-btn value="list">
            <v-icon>mdi-format-list-bulleted</v-icon>
            <v-tooltip activator="parent" location="top">List view</v-tooltip>
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <!-- No Projects State -->
    <!-- <v-row v-else-if="!filteredProjects.length">
      <v-col cols="12" class="text-center">
        <v-icon
          size="64"
          color="grey-lighten-1"
          class="mb-4"
        >
          mdi-folder-open
        </v-icon>
        <h3 class="text-h6 text-grey-darken-1">No projects found</h3>
        <p class="text-body-1 text-grey-darken-1">
          {{ search ? 'Try different search terms' : 'Create your first project' }}
        </p>
        <v-btn
          v-if="!search"
          color="primary"
          prepend-icon="mdi-plus"
          class="mt-4"
          to="/create"
        >
          Create Project
        </v-btn>
      </v-col>
    </v-row> -->

    <!-- Empty State -->
    <v-container v-if="!loading && filteredProjects.length === 0" class="text-center py-12">
      <v-icon
        size="64"
        color="grey-lighten-1"
        class="mb-4"
      >
        mdi-folder-open-outline
      </v-icon>
      <h3 class="text-h5 font-weight-bold mb-2">
        {{ search ? 'No matching projects found' : 'No projects yet' }}
      </h3>
      <p class="text-body-1 text-medium-emphasis mb-6">
        {{ search 
          ? 'Try adjusting your search or filters' 
          : 'Create your first project to get started'
        }}
      </p>
      <v-btn
        v-if="!search"
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        to="/create"
      >
        Create Project
      </v-btn>
    </v-container>

    <!-- List View -->
    <div v-if="viewType === 'list'" class="list-view">
      <v-card
        v-for="project in filteredProjects"
        :key="project.id"
        :to="`/project/${project.id}`"
        class="mb-3 list-item-card"
        elevation="0"
        variant="outlined"
      >
        <div class="d-flex align-center pa-4">
          <!-- Thumbnail -->
          <div class="thumbnail-container mr-4">
            <v-img
              :src="project.thumbnail || '/default-project.jpg'"
              :aspect-ratio="16/9"
              cover
              width="200"
              height="120"
              class="rounded"
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
          </div>

          <!-- Content -->
          <div class="flex-grow-1">
            <div class="d-flex justify-space-between align-start">
              <div>
                <h3 class="text-h6 mb-1">{{ project.title }}</h3>
                <p class="text-body-2 text-medium-emphasis mb-2">
                  {{ truncateText(project.description, 120) }}
                </p>
                <div class="d-flex align-center">
                  <v-chip
                    v-for="tag in project.tags"
                    :key="tag"
                    size="small"
                    class="mr-2"
                    variant="tonal"
                  >
                    {{ tag }}
                  </v-chip>
                </div>
              </div>

              <!-- Actions -->
              <div class="d-flex align-center">
                <v-btn
                  icon
                  variant="text"
                  :color="project.isLiked ? 'error' : undefined"
                  @click.stop="toggleLike(project)"
                  :loading="likeLoadingMap[project.id]"
                >
                  <v-icon>{{ project.isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                </v-btn>
                <span class="text-caption mr-4">{{ project.likes?.length || 0 }}</span>
                <span class="text-caption text-medium-emphasis">
                  {{ formatDate(project.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </div>

    <!-- Grid View -->
    <v-row v-else>
      <v-col
        v-for="project in filteredProjects"
        :key="project.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          :to="`/project/${project.id}`"
          class="h-100"
        >
          <v-img
            :src="project.thumbnail || '/default-project.jpg'"
            height="200"
            cover
            class="align-end"
          >
            <v-card-title class="text-white bg-black bg-opacity-50">
              {{ project.title }}
            </v-card-title>
          </v-img>

          <v-card-text>
            <p class="text-truncate">{{ project.description }}</p>
            <v-chip-group>
              <v-chip
                v-for="tag in project.tags"
                :key="tag"
                size="small"
                class="mr-1"
              >
                {{ tag }}
              </v-chip>
            </v-chip-group>
          </v-card-text>

          <v-card-actions>
            <v-btn
              icon
              variant="text"
              :color="project.isLiked ? 'error' : undefined"
              @click.stop="handleLike(project)"
              :loading="likeLoadingMap[project.id]"
            >
              <v-icon>{{ project.isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
            </v-btn>
            <span class="text-caption">{{ project.likes?.length || 0 }}</span>
            <v-spacer></v-spacer>
            <span class="text-caption">
              {{ new Date(project.createdAt).toLocaleDateString() }}
            </span>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'ProjectsView',
  data() {
    return {
      loading: false,
      search: '',
      sortBy: 'newest',
      viewType: 'grid',
      likeLoadingMap: {},
      sortOptions: [
        { title: 'Newest First', value: 'newest' },
        { title: 'Oldest First', value: 'oldest' },
        { title: 'Most Liked', value: 'likes' },
        { title: 'Most Viewed', value: 'views' }
      ]
    }
  },
  computed: {
    ...mapGetters({
      projects: 'projects/getProjects'
    }),
    filteredProjects() {
      let filtered = [...this.projects]

      // Apply search filter
      if (this.search) {
        const searchLower = this.search.toLowerCase()
        filtered = filtered.filter(project => 
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      }

      // Apply sorting
      switch (this.sortBy) {
        case 'oldest':
          filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          break
        case 'likes':
          filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0))
          break
        case 'views':
          filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
          break
        default: // newest
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }

      return filtered
    }
  },
  methods: {
    ...mapActions({
      fetchProjects: 'projects/fetchProjects',
      toggleProjectLike: 'projects/toggleLike'
    }),
    async loadProjects() {
      this.loading = true
      try {
        await this.fetchProjects()
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        this.loading = false
      }
    },
    filterProjects() {
      // Debounce implementation can be added here if needed
    },
    async handleLike(project) {
      if (this.likeLoadingMap[project.id]) return
      
      this.$set(this.likeLoadingMap, project.id, true)
      try {
        await this.toggleProjectLike(project)
      } catch (error) {
        console.error('Error toggling like:', error)
      } finally {
        this.$set(this.likeLoadingMap, project.id, false)
      }
    },
    truncateText(text, length) {
      if (!text) return ''
      return text.length > length 
        ? text.substring(0, length) + '...' 
        : text
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  },
  mounted() {
    this.loadProjects()
  }
}
</script>

<style scoped>
.list-view {
  max-width: 100%;
}

.list-item-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}

.list-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.thumbnail-container {
  flex-shrink: 0;
}

.v-chip {
  font-size: 12px;
  height: 24px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .list-item-card .d-flex {
    flex-direction: column;
  }

  .thumbnail-container {
    margin-right: 0;
    margin-bottom: 16px;
    width: 100%;
  }

  .thumbnail-container .v-img {
    width: 100%;
    height: auto;
  }
}

/* Make sure text doesn't overflow */
.text-h6 {
  word-break: break-word;
}

.text-body-2 {
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style> 