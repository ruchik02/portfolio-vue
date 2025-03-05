<template>
  <v-container>
    <h1 class="text-h4 mb-6">Help & Support</h1>
    
    <v-row>
      <v-col cols="12" md="8">
        <v-expansion-panels>
          <v-expansion-panel
            v-for="faq in faqs"
            :key="faq.question"
          >
            <v-expansion-panel-title>
              {{ faq.question }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              {{ faq.answer }}
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-card class="mt-6">
          <v-card-title>Contact Support</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submitSupport">
              <v-text-field
                v-model="supportForm.subject"
                label="Subject"
                required
              ></v-text-field>
              
              <v-textarea
                v-model="supportForm.message"
                label="Message"
                required
                rows="4"
              ></v-textarea>
              
              <v-btn
                color="primary"
                type="submit"
                block
              >
                Submit
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Quick Links</v-card-title>
          <v-list>
            <v-list-item
              v-for="link in quickLinks"
              :key="link.title"
              :title="link.title"
              :prepend-icon="link.icon"
              :to="link.path"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'SupportView',
  data() {
    return {
      faqs: [
        {
          question: 'How do I create a new project?',
          answer: 'Navigate to the Create Project page and fill in the required information.'
        },
        {
          question: 'How can I update my profile?',
          answer: 'Go to your Profile page and click on the Edit Profile button.'
        }
      ],
      quickLinks: [
        {
          title: 'Getting Started',
          icon: 'mdi-book-open-page-variant',
          path: '/support/getting-started'
        },
        {
          title: 'FAQ',
          icon: 'mdi-frequently-asked-questions',
          path: '/support/faq'
        },
        {
          title: 'Contact Us',
          icon: 'mdi-email',
          path: '/support/contact'
        }
      ],
      supportForm: {
        subject: '',
        message: ''
      }
    }
  },
  methods: {
    submitSupport() {
      // Implement support form submission logic here
      console.log('Support form submitted:', this.supportForm)
    }
  }
}
</script> 