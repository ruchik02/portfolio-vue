<template>
  <v-container>
    <h1 class="text-h4 mb-6">Analytics</h1>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-title>Project Views</v-card-title>
          <v-card-text>
            <v-sheet class="pa-4">
              <!-- Placeholder for chart -->
              <div class="chart-placeholder">
                Chart Component Will Go Here
              </div>
            </v-sheet>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-title>Engagement Stats</v-card-title>
          <v-list>
            <v-list-item
              v-for="stat in stats"
              :key="stat.title"
              :title="stat.title"
              :subtitle="stat.value"
              :prepend-icon="stat.icon"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'AnalyticsView',
  data() {
    return {
      stats: [
        {
          title: 'Total Views',
          value: '1,234',
          icon: 'mdi-eye'
        },
        {
          title: 'Total Likes',
          value: '567',
          icon: 'mdi-thumb-up'
        },
        {
          title: 'Comments',
          value: '89',
          icon: 'mdi-comment'
        }
      ]
    }
  }
}
</script>

<style scoped>
.chart-placeholder {
  height: 300px;
  background-color: rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}
</style> 