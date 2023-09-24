<script>
import {defineComponent, onMounted, ref} from 'vue'

export default defineComponent({
  name: "RunTime",
  setup() {
    const runningTime = ref('');
    const startTime = new Date("2023-08-23T00:00:00");
    const updateRunningTime = () => {

      const currentTime = new Date();
      const timeDiff = currentTime - startTime;

      const seconds = Math.floor(timeDiff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      runningTime.value = `${days} 天 ${hours % 24} 时 ${minutes % 60} 分 ${seconds % 60} 秒`;
    }

    onMounted(() => {
      startTime.value = new Date();
      updateRunningTime(); // 初始化时更新一次时间
      setInterval(() => {
        updateRunningTime();
      }, 1000);
    });

    return {
      runningTime
    }
  }
})
</script>

<template>
  <div class="text-center">
    <p class="mb-2">
      <v-icon class="pr-2" color="primary" icon="" size="x-small">
        mdi-clock-time-eleven-outline
      </v-icon>
      <span>已坚持熬夜</span>
    </p>
    <p>{{ runningTime }}</p>
  </div>


</template>

<style scoped>

</style>