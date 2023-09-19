<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  document.title = "出错啦！！(⌐■_■)"
});
</script>

<template>
<div>
  <v-alert
      color="error"
      icon="mdi-lightbulb-alert-outline"
      density="compact">
    服务器似乎挂掉了呢~改天再来吧！
  </v-alert>
</div>
</template>

<style scoped>

</style>