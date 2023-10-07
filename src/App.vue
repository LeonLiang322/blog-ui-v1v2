<script setup>
import Snackbar from "@/components/Snackbar.vue";
import {nextTick, onBeforeMount, provide, ref} from "vue";
import {keepAlive} from "@/utils/UserUtil";
const isRouterAlive = ref(true);
const reload = () => {
  isRouterAlive.value = false;
  nextTick(() => {
    isRouterAlive.value = true;
  });
}
provide('reload', reload);
onBeforeMount(() => {
  keepAlive(reload);
});
</script>

<template>
  <div id="app">
    <router-view v-if="isRouterAlive"/>
    <Snackbar/>
  </div>
</template>

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
.rainbow-font {
  animation: rainbow 3s alternate infinite forwards;
}
.rainbow-font-reverse {
  animation: rainbow-reverse 3s alternate infinite forwards;
  animation-delay: 1s;
}
@keyframes rainbow {
  0% {
    color: #64FFDA;
  }
  50% {
    color: #FFF;
  }
  100% {
    color: #FED504;
  }
}
@keyframes rainbow-reverse {
  0% {
    color: #FED504;
  }
  50% {
    color: #FFF;
  }
  100% {
    color: #64FFDA;
  }
}
</style>
