<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: "Steps"
})
</script>

<template>
  <div class="step no1"></div>
  <div class="step no2"></div>
  <div class="step no3"></div>
<!--  <div class="step text">最新</div>-->
</template>

<style scoped>
.step {
  border-radius: 3px;
  height: 6px;
  position: absolute;
  background-color: white;
  opacity: 0;
  transition: opacity 1s;
  animation: step-loop 2s infinite;
}
.no1 {
  left: 44dvw;
  top: 97dvh;
  width: 12dvw;
  animation-delay: 0.6s;
}
.no2 {
  left: 46dvw;
  top: 94dvh;
  width: 8dvw;
  animation-delay: 0.3s;
}
.no3 {
  left: 48dvw;
  top: 91dvh;
  width: 4dvw;
}
.text {
  border: 1px solid red;
  left: 48dvw;
  top: 87dvh;
  width: 4dvw;
  color: white;
  background: none;
  text-align: center;
  font-size: 12px;
  white-space: nowrap;
}
@keyframes step-loop {
  0% {
    opacity: 0;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>