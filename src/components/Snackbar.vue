<template>
  <v-snackbar
      class="d-flex align-center"
      v-model="visible"
      :color="type ? type : 'primary'">
    <p>
      <v-icon v-if="type" size="small">mdi-{{ setIcon(type) }}</v-icon>
      {{ store.state.snackbar.msg }}
    </p>

    <template v-slot:actions>
      <v-btn
          v-if="showClose"
          color="white"
          variant="plain"
          icon="mdi-close"
          size="small"
          @click="close">
      </v-btn>
    </template>
  </v-snackbar>

</template>

<script>

import store from "../store";

export default {
  data() {
    return {};
  },
  computed: {
    store() {
      return store
    },
    visible() {
      return this.$store.state.snackbar.visible;
    },
    showClose() {
      return this.$store.state.snackbar.showClose;
    },
    type() {
      return this.$store.state.snackbar.type;
    },
  },
  methods: {
    setIcon(v) {
      switch (v) {
        case 'info':
          return 'information-variant-circle-outline';
        case 'warning':
          return 'alert-outline';
        case 'error':
          return 'progress-close';
        case 'success':
          return 'check-circle-outline';
        default:
          return '';
      }
    },
    close() {
      this.$store.commit("snackbar/CLOSE_SNACKBAR");
    },
  },
};
</script>