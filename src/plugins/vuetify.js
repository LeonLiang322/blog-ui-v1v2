// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { md3 } from 'vuetify/blueprints'

// Vuetify

import { createVuetify, ThemeDefinition } from 'vuetify'

const myCustomLightTheme = {
  dark: false,
  colors: {
    background: '#15191F',
    surface: '#2f323a',
    primary: '#FED504',
    // 'primary-darken-1': '#3700B3',
    secondary: '#03DAC6',
    // 'secondary-darken-1': '#018786',
    text: '#FFFFFF',
    error: '#E53935',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
  },
}

export default createVuetify({
  defaults: {
    global: {
      ripple: false,
    },
    VCard: {
      elevation: 4,
      color: 'surface'
    },
    VButton: {
      color: 'white'
    }
  },
  theme: {
    defaultTheme: 'myCustomLightTheme',
    themes: {
      myCustomLightTheme,
    },
  },
  blueprint: md3,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

