import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify'
import store from './store'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import '@mdi/font/css/materialdesignicons.css'

// Create a Vuetify instance
const vuetify = createVuetify({
    components,
    icons: {
        defaultSet: 'mdi',
    },
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#1867C0',
                    secondary: '#5CBBF6',
                    success: '#4CAF50',
                    error: '#FF5252',
                }
            },
            dark: {
                colors: {
                    primary: '#2196F3',
                    secondary: '#424242',
                    success: '#4CAF50',
                    error: '#FF5252',
                }
            }
        }
    }
})


const app = createApp(App)

app.use(router)
app.use(store)
app.use(vuetify)

app.mount('#app')
