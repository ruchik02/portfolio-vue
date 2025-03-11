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

        <!-- <v-card class="mt-6">
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
        </v-card> -->
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
        },
        {
        question: 'What file types are supported for project uploads?',
        answer: 'We support various file types including images (JPG, PNG, GIF), documents (PDF, DOC), and source code files. Maximum file size is 10MB per file.'
      },
      {
        question: 'How do I delete my project?',
        answer: 'Navigate to your project page, click on the menu (three dots) in the top right corner, and select "Delete Project". Confirm the deletion when prompted.'
      },
      {
        question: 'Can I edit my project after publishing?',
        answer: 'Yes, you can edit your project at any time. Go to your project page and click the "Edit" button to modify details, add/remove files, or update tags.'
      },
      {
        question: 'How do tags work?',
        answer: 'Tags help categorize your projects and make them discoverable. You can add up to 5 tags per project. Use relevant tags to help others find your work.'
      },
      {
        question: 'How can I bookmark projects?',
        answer: 'Click the bookmark icon on any project to save it to your bookmarks. Access your saved projects through the Bookmarks section in the navigation menu.'
      },
      // {
      //   question: 'How do I view my analytics?',
      //   answer: 'Go to the Analytics page to view detailed statistics about your projects, including views, likes, and engagement metrics over time.'
      // },
      {
        question: 'Can I delete comments on my projects?',
        answer: 'Yes, you can delete any comments on your own projects. Click the menu icon (three dots) next to the comment and select "Delete".'
      },
      {
        question: 'How do I change my password?',
        answer: 'Go to Settings in the navigation menu, select "Security", and click on "Change Password". Follow the prompts to update your password.'
      },
      {
        question: 'What is the difference between views and engagement?',
        answer: 'Views count how many times your project has been accessed, while engagement includes interactions like likes and comments.'
      },
      {
        question: 'How can I contact support?',
        answer: 'For additional help, email us at support@creativehub.com or use the contact form at the bottom of this page.'
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