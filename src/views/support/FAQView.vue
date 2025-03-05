<template>
  <v-container>
    <h1 class="text-h4 mb-6">Frequently Asked Questions</h1>
    
    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-list density="compact">
            <v-list-item
              v-for="(category, index) in categories"
              :key="index"
              :title="category"
              @click="selectedCategory = category"
              :active="selectedCategory === category"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="9">
        <v-expansion-panels>
          <v-expansion-panel
            v-for="faq in filteredFaqs"
            :key="faq.question"
          >
            <v-expansion-panel-title>{{ faq.question }}</v-expansion-panel-title>
            <v-expansion-panel-text>{{ faq.answer }}</v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'FAQView',
  data() {
    return {
      selectedCategory: 'General',
      categories: ['General', 'Projects', 'Account', 'Technical'],
      faqs: [
        {
          category: 'General',
          question: 'What is this platform about?',
          answer: 'Our platform helps users manage and collaborate on projects.'
        },
        {
          category: 'Projects',
          question: 'How do I create a new project?',
          answer: 'Navigate to the Create Project page and fill in the required information.'
        },
        {
          category: 'Account',
          question: 'How do I update my profile?',
          answer: 'Go to your Profile page and click on the Edit Profile button.'
        },
        {
          category: 'Technical',
          question: 'What browsers are supported?',
          answer: 'We support all modern browsers including Chrome, Firefox, Safari, and Edge.'
        }
      ]
    }
  },
  computed: {
    filteredFaqs() {
      return this.faqs.filter(faq => faq.category === this.selectedCategory)
    }
  }
}
</script> 