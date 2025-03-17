<template>
  <v-card>
    <!-- Default content slot -->
    <slot>
      <v-img
        :src="project.thumbnail || '/default-project.jpg'"
        height="200"
        cover
      ></v-img>
      <v-card-title>{{ project.title }}</v-card-title>
    </slot>

    <!-- Named slot for custom actions -->
    <slot name="actions">
      <v-card-actions>
        <v-btn
          icon
          variant="text"
          :color="project.isLiked ? 'error' : undefined"
          :loading="likeLoading"
          @click.stop="handleLike"
        >
          <v-icon>
            {{ project.isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}
          </v-icon>
        </v-btn>
        <span class="text-caption">{{ project.likeCount || 0 }}</span>
        <v-spacer></v-spacer>
        <slot name="extra-actions"></slot>
        <v-btn @click="handleView">View Project</v-btn>
      </v-card-actions>
    </slot>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ProjectCard',
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  methods: {
    ...mapActions({
      viewProject: 'projects/viewProject'
    }),
    async handleView() {
      try {
        await this.viewProject(this.project.id)
        this.$router.push(`/project/${this.project.id}`)
      } catch (error) {
        console.error('Error:', error)
        this.$emit('error', error.message)
      }
    }
  }
}
</script> 