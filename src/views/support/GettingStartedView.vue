<template>
  <v-container>
    <h1 class="text-h4 mb-6">Getting Started</h1>
    <v-timeline density="comfortable">
      <v-timeline-item
        v-for="(step, index) in steps"
        :key="index"
        :dot-color="step.color"
        size="small"
      >
        <v-card>
          <v-card-title class="text-h6">
            {{ step.title }}
          </v-card-title>
          <v-card-text>
            {{ step.description }}
            <v-btn
              v-if="step.action"
              :to="step.action.path"
              color="primary"
              class="mt-3"
              variant="text"
            >
              {{ step.action.text }} <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-timeline-item>
    </v-timeline>
  </v-container>
</template>

<script>
export default {
  name: 'GettingStartedView',
  data() {
    return {
      steps: [
        {
          title: 'Create Your Profile',
          description: 'Complete your profile to get started with our platform.',
          color: 'primary',
          action: {
            text: 'Go to Profile',
            path: '/profile'
          }
        },
        {
          title: 'Create Your First Project',
          description: 'Start by creating your first project.',
          color: 'success',
          action: {
            text: 'Create Project',
            path: '/create'
          }
        },
        {
          title: 'Explore Other Projects',
          description: 'Discover and interact with other projects in the community.',
          color: 'info',
          action: {
            text: 'Explore Projects',
            path: '/explore'
          }
        }
      ]
    }
  }
}
</script> 