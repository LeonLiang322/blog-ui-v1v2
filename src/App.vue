<template>
  <div id="app">
    <router-view />
    <Snackbar/>
  </div>
</template>

<script>
import Snackbar from "@/components/Snackbar.vue";
export default {
  name: 'App',
  components: {
    Snackbar,
  }
}
</script>

<style>
* {
  /*font-family: 'SmileySans', sans-serif;*/
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -ms-overflow-style: scrollbar;
}
/* 隐藏滚动条的背景颜色和默认样式 */
::-webkit-scrollbar {
  width: 8px; /* 定义滚动条宽度 */
  height: 8px;
}
/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: #888;
}
/* 鼠标悬停在滚动条上时的滑块样式 */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
