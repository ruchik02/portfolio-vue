<template>
  <v-container>
    <!-- Header Section -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4">Analytics</h1>
      <v-select
        v-model="timeRange"
        :items="timeRanges"
        label="Time Range"
        variant="outlined"
        density="comfortable"
        hide-details
        style="max-width: 200px"
      ></v-select>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-overline font-weight-bold">TOTAL VIEWS</div>
              <v-icon color="primary" size="24">mdi-eye</v-icon>
            </div>
            <div class="text-h4 font-weight-bold mb-1">0</div>
            <div class="d-flex align-center">
              <v-icon color="success" size="small" class="mr-1">mdi-trending-up</v-icon>
              <span class="text-caption text-success">15% from last period</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-overline font-weight-bold">TOTAL LIKES</div>
              <v-icon color="error" size="24">mdi-heart</v-icon>
            </div>
            <div class="text-h4 font-weight-bold mb-1">2</div>
            <div class="d-flex align-center">
              <v-icon color="success" size="small" class="mr-1">mdi-trending-up</v-icon>
              <span class="text-caption text-success">8% from last period</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-overline font-weight-bold">COMMENTS</div>
              <v-icon color="success" size="24">mdi-comment</v-icon>
            </div>
            <div class="text-h4 font-weight-bold mb-1">0</div>
            <div class="d-flex align-center">
              <v-icon color="success" size="small" class="mr-1">mdi-trending-up</v-icon>
              <span class="text-caption text-success">12% from last period</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-overline font-weight-bold">PROJECTS</div>
              <v-icon color="info" size="24">mdi-folder</v-icon>
            </div>
            <div class="text-h4 font-weight-bold mb-1">2</div>
            <div class="d-flex align-center">
              <v-icon color="success" size="small" class="mr-1">mdi-trending-up</v-icon>
              <span class="text-caption text-success">5% from last period</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Section -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <span>Views Over Time</span>
            <v-btn-toggle
              v-model="viewsChartType"
              mandatory
              density="comfortable"
              color="primary"
            >
              <v-btn value="line" size="small">
                <v-icon>mdi-chart-line</v-icon>
              </v-btn>
              <v-btn value="bar" size="small">
                <v-icon>mdi-chart-bar</v-icon>
              </v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <v-sheet class="pa-4">
              <div class="chart-placeholder d-flex align-center justify-center">
                <span class="text-medium-emphasis">Views chart will appear here</span>
              </div>
            </v-sheet>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title class="pa-4">Engagement Distribution</v-card-title>
          <v-card-text>
            <v-sheet class="pa-4">
              <div class="chart-placeholder d-flex align-center justify-center">
                <span class="text-medium-emphasis">Distribution chart will appear here</span>
              </div>
            </v-sheet>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Top Projects Table -->
    <v-card class="mt-6">
      <v-card-title class="pa-4">Top Performing Projects</v-card-title>
      <v-table>
        <thead>
          <tr>
            <th class="text-left" style="width: 50px"></th>
            <th class="text-left">Project</th>
            <th class="text-left">Engagement</th>
            <th class="text-right">Views</th>
            <th class="text-right">Likes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <v-avatar size="40" rounded>
                <v-img src="/default-project.jpg" cover></v-img>
              </v-avatar>
            </td>
            <td>
              <div class="font-weight-medium">Sample Project</div>
              <div class="text-caption text-medium-emphasis">
                Created Mar 10, 2024
              </div>
            </td>
            <td>
              <div class="d-flex align-center">
                <v-icon size="small" color="primary" class="mr-1">mdi-eye</v-icon>
                <span class="mr-2">0</span>
                <v-icon size="small" color="error" class="mr-1">mdi-heart</v-icon>
                <span class="mr-2">0</span>
                <v-icon size="small" color="success" class="mr-1">mdi-comment</v-icon>
                <span>0</span>
              </div>
            </td>
            <td class="text-right">0</td>
            <td class="text-right">0</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'AnalyticsView',
  data() {
    return {
      timeRange: '30d',
      timeRanges: [
        { title: 'Last 7 Days', value: '7d' },
        { title: 'Last 30 Days', value: '30d' },
        { title: 'Last 90 Days', value: '90d' },
        { title: 'Last Year', value: '1y' }
      ],
      viewsChartType: 'line'
    }
  }
}
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.chart-placeholder {
  height: 300px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
}

.v-card {
  border-radius: 12px;
}
</style> 