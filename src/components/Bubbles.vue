<template>
  <div class="bubbles">
    <span style="--i:11"></span>
    <span style="--i:12"></span>
    <span style="--i:24"></span>
    <span style="--i:10"></span>
    <span style="--i:14"></span>
    <span style="--i:23"></span>
    <span style="--i:18"></span>
    <span style="--i:16"></span>
    <span style="--i:19"></span>
    <span style="--i:20"></span>
    <span style="--i:22"></span>
    <span style="--i:25"></span>
    <span style="--i:18"></span>
    <span style="--i:21"></span>
    <span style="--i:15"></span>
    <span style="--i:13"></span>
  </div>
</template>

<script>
export default {
  name: 'Bubbles'
}
</script>

<style scoped>
.bubbles {
  position: absolute;
  display: flex;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}
.bubbles span {
  position: relative;
  width: 20px;
  height: 20px;
  background: #fed504;
  margin-left: 5vw;
  border-radius: 50%;
  box-shadow: 0 0 0 10px #fed50444,
  0 0 50px #fed504,
  0 0 100px #fed504;
  animation: background 15s linear infinite;
  animation-duration: calc(155s / var(--i));
}
.bubbles span:nth-child(even) {
  background: #4fc3dc;
  box-shadow: 0 0 0 10px #4fc3dc44,
  0 0 50px #4fc3dc,
  0 0 100px #4fc3dc;
}
@keyframes background {
  0% {
    transform: translateY(100vh) scale(0);
  }
  100% {
    transform: translateY(-20vh) scale(1);
  }
}
</style>
