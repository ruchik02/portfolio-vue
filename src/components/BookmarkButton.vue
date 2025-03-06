<template>
  <v-btn
    :icon="isBookmarked ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
    :color="isBookmarked ? 'primary' : undefined"
    variant="text"
    :loading="loading"
    @click="toggleBookmark"
  >
    <v-tooltip activator="parent" location="top">
      {{ isBookmarked ? 'Remove bookmark' : 'Bookmark project' }}
    </v-tooltip>
  </v-btn>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'BookmarkButton',
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    ...mapGetters({
      isBookmarked: 'bookmarks/isBookmarked'
    }),
    isProjectBookmarked() {
      return this.isBookmarked(this.project.id)
    }
  },
  methods: {
    ...mapActions({
      addBookmark: 'bookmarks/addBookmark',
      removeBookmark: 'bookmarks/removeBookmark'
    }),
    async toggleBookmark() {
      if (!this.$store.state.auth.user) {
        this.$router.push('/login')
        return
      }

      this.loading = true
      try {
        if (this.isProjectBookmarked) {
          await this.removeBookmark(this.project.id)
          if (this.$toast) {
            this.$toast.success('Bookmark removed')
          }
        } else {
          await this.addBookmark(this.project)
          if (this.$toast) {
            this.$toast.success('Project bookmarked')
          }
        }
      } catch (error) {
        console.error('Error toggling bookmark:', error)
        if (this.$toast) {
          this.$toast.error('Failed to update bookmark')
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script> 