<script setup>
import { useRoute } from "vue-router";

const msg = useRoute().query.msg;

</script>

<template>
<div>
  <v-alert
      color="error"
      icon="mdi-lightbulb-alert-outline"
      density="compact">
    <p class="text-h6">服务器似乎出现了点问题~请稍后再试</p>
    <p class="mt-2" v-if="msg">
      错误原因：{{ msg }}
    </p>
  </v-alert>
</div>
</template>

<style scoped>

</style>