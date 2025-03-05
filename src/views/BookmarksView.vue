<template>
  <v-container>
    <h1 class="text-h4 mb-6">Bookmarks</h1>
    <v-row>
      <v-col
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card>
          <v-card-title>{{ bookmark.title }}</v-card-title>
          <v-card-subtitle>{{ bookmark.description }}</v-card-subtitle>
          <v-card-actions>
            <v-btn
              variant="text"
              color="primary"
              :to="bookmark.link"
            >
              View Project
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              icon
              @click="removeBookmark(bookmark.id)"
            >
              <v-icon>mdi-bookmark-remove</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'BookmarksView',
  data() {
    return {
      bookmarks: [
        {
          id: 1,
          title: 'Sample Project 1',
          description: 'A great project you bookmarked',
          link: '/projects/1'
        },
        {
          id: 2,
          title: 'Sample Project 2',
          description: 'Another interesting project',
          link: '/projects/2'
        }
      ]
    }
  },
  methods: {
    removeBookmark(id) {
      this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id)
    }
  }
}
</script> 