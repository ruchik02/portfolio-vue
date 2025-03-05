<template>
  <v-container>
    <h1 class="text-h4 mb-6">Contact Support</h1>
    
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <v-form @submit.prevent="submitForm" ref="form">
              <v-text-field
                v-model="form.name"
                label="Name"
                :rules="[v => !!v || 'Name is required']"
                required
              ></v-text-field>
              
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                :rules="emailRules"
                required
              ></v-text-field>
              
              <v-select
                v-model="form.category"
                :items="categories"
                label="Category"
                required
              ></v-select>
              
              <v-textarea
                v-model="form.message"
                label="Message"
                :rules="[v => !!v || 'Message is required']"
                required
                rows="5"
              ></v-textarea>
              
              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
              >
                Submit
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Other Ways to Reach Us</v-card-title>
          <v-list>
            <v-list-item
              prepend-icon="mdi-email"
              title="Email"
              subtitle="support@example.com"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-phone"
              title="Phone"
              subtitle="1-800-SUPPORT"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'ContactView',
  data() {
    return {
      loading: false,
      form: {
        name: '',
        email: '',
        category: '',
        message: ''
      },
      categories: [
        'General Inquiry',
        'Technical Support',
        'Billing',
        'Feature Request',
        'Bug Report'
      ],
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid'
      ]
    }
  },
  methods: {
    async submitForm() {
      if (!this.$refs.form.validate()) return
      
      this.loading = true
      try {
        // Implement your form submission logic here
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
        this.$refs.form.reset()
        // Show success message
      } catch (error) {
        // Handle error
        console.error('Form submission error:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script> 