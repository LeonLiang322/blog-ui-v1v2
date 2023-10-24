// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { md2 } from 'vuetify/blueprints'

// Vuetify

import { createVuetify, ThemeDefinition } from 'vuetify'

const myCustomLightTheme = {
  dark: false,
  colors: {
    background: '#111',
    surface: '#222',
    primary: '#FED504',
    secondary: '#03DAC6',
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
      color: 'surface',
      style: [{
        border: '2px solid transparent',
        backgroundClip: 'padding-box, border-box',
        backgroundOrigin: 'padding-box, border-box',
        backgroundImage: 'linear-gradient(to right, #222, #222), linear-gradient(90deg, #FED504, #03DAC6)',
      }]
    },
    VButton: {
      color: 'white'
    },
  },
  theme: {
    defaultTheme: 'myCustomLightTheme',
    themes: {
      myCustomLightTheme,
    },
  },
  blueprint: md2,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

