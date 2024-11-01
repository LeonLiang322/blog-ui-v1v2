<script setup>
import {onMounted, ref} from 'vue';
import moonSvg from '@/assets/moon.svg'
import Bubbles from "@/components/Bubbles.vue";
import Steps from "@/components/Steps.vue";
import RunTime from "@/components/RunTime.vue";
import req from "@/utils/RequestUtil";
import store from "@/store";
import {useRequest} from "vue-request";
import {onBeforeRouteLeave} from "vue-router";
import router from "@/router";
const getSentencesService = async () => {
  const results = await req.sys.get('/sentences/latest');
  return results.data.data;
}
const getArticlesService = async () => {
  const results = await req.sys.get('/articles/latest');
  return results.data.data;
}
const getPhotosService = async () => {
  const results = await req.sys.get('/photos/latest');
  return results.data.data;
}
// 获取最新三个每日一言
const {
  data: sentences,
  run: getSentencesRun,
  loading: sentenceLoading
} = useRequest(getSentencesService);
getSentencesRun();
// 获取最新三个每日一言
const {
  data: articles,
  run: getArticlesRun,
  loading: articleLoading
} = useRequest(getArticlesService);
getArticlesRun();
// 获取最新三个每日一言
const {
  data: photos,
  run: getPhotosRun,
  loading: photoLoading
} = useRequest(getPhotosService);
getPhotosRun();

const canvas = ref();
const stepDiv = ref();
const centerDiv = ref();
const buttonDiv = ref();
const isInitialLoad = ref(true);
const jumpDisable = ref(false);
const bubbleVis = ref(false);
const currentPage = ref(-1);

const initialPositions = [];
const targetXLeft = -0.5 * window.innerWidth; // 页面外左终点
const targetXRight = 1.5 * window.innerWidth; // 页面外右终点
const animationDuration = 1500; // 动画持续事件ms
let animationStartTime = 0;
let animationRequestId = null;
let wheelEventDisabled = false;

// 所有Canvas建筑物
const buildings = [
  { x: 0.06, y: 0.19, width: 0.12, height: 0.75 }, // 2
  { x: 0.15, y: 0.39, width: 0.1, height: 0.55 }, // 3
  { x: 0.04, y: 0.66, width: 0.17, height: 0.28 }, // 1
  { x: 0.28, y: 0.74, width: 0.1, height: 0.2 }, // 4
  { x: 0.41, y: 0.9, width: 0, height: 0.04 }, // 左灯管
  { x: 0.41, y: 0.9, width: 0, height: 0.003, line: 10, color: '#4fc3dc' }, // 左灯泡
  { x: 0, y: 0.94, width: 0.42, height: 0, line: 10 }, // 左路

  { x: 0.59, y: 0.9, width: 0, height: 0.04 }, // 右灯管
  { x: 0.59, y: 0.9, width: 0, height: 0.003, line: 10, color: '#4fc3dc' }, // 右灯泡
  { x: 0.76, y: 0.49, width: 0.1, height: 0.45 }, // 7
  { x: 0.66, y: 0.7, width: 0.14, height: 0.24 }, // 6
  { x: 0.62, y: 0.82, width: 0.1, height: 0.12 }, // 5
  { x: 0.88, y: 0.14, width: 0.08, height: 0.8 }, // 8
  { x: 0.58, y: 0.94, width: 0.42, height: 0, line: 10 }, // 右路
];

// 处理滚轮事件
function handleWheel(e) {
  if (wheelEventDisabled) return;
  // 执行动画
  if (e.deltaY > 0 && currentPage.value < 0) {
    // 向下滚动时
    currentPage.value = 1;
    canvasMove(true);
    fadeOutDivs();
  } else if (e.deltaY < 0 && currentPage.value > 0) {
    // 向上滚动时
    jumpDisable.value = true;
    currentPage.value = -1;
    canvasMove(false);
    fadeInDivs();
  } else return;
  // 执行滚动
  const scrollTo = currentPage.value * window.innerHeight;
  wheelEventDisabled = true;
  setTimeout(() => {
    window.scrollTo({ top: scrollTo, behavior: 'smooth' });
  }, 500);
  setTimeout(() => { wheelEventDisabled = false }, animationDuration);
}

function drawing(ctx, x, y, width, height, line=6, color='white') {
  ctx.shadowBlur = 0;
  if (color !== 'white') {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
  }
  ctx.fillStyle = '#15191f';
  ctx.strokeStyle = color;
  ctx.lineWidth = line;
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fill();
  ctx.stroke();
}

function fadeOutDivs() {
  centerDiv.value.style.transition = 'all 0.5s';
  buttonDiv.value.style.transition = 'all 0.5s';
  stepDiv.value.style.transition = 'all 0.5s';
  centerDiv.value.style.opacity = '0';
  buttonDiv.value.style.opacity = '0';
  stepDiv.value.style.opacity = '0';
  buttonDiv.value.style.transform = 'translateY(15px)'
  setTimeout(() => {
    jumpDisable.value = false;
  }, 500);
}

function fadeInDivs() {
  setTimeout(() => {
    centerDiv.value.style.transition = 'all 2s';
    buttonDiv.value.style.transition = 'all 1s';
    stepDiv.value.style.transition = 'all 2s';
    centerDiv.value.style.opacity = '1';
  }, 1000)
  setTimeout(() => {
    buttonDiv.value.style.opacity = '1';
    buttonDiv.value.style.transform = 'translateY(0px)'
  }, 1500);
  setTimeout(() => {
    stepDiv.value.style.opacity = '1';

  }, 2000);
  setTimeout(() => {
    jumpDisable.value = false;
  }, 2500);
}

const canvasMove = isOut => {
  if (animationRequestId) return; // 动画是否正在进行
  const canvasWidth = canvas.value.width;
  const canvasHeight = canvas.value.height;
  animationStartTime = performance.now();
  const animateStep = (timestamp) => {
    const progress = Math.min((timestamp - animationStartTime) / animationDuration, 1); // 动画进度 0~1
    // 每次清空画布并重新绘制
    const ctx = canvas.value.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    buildings.forEach((building, index) => {
      // 移出时初始位置设为原点 移入时则将屏幕外位置设为原点
      const initialX = isOut ? initialPositions[index].x : (index < 7) ? targetXLeft : targetXRight;
      const targetY = building.y * canvasHeight;
      const targetWidth = building.width * canvasWidth;
      const targetHeight = building.height * canvasHeight;
      const x = isOut ? lerp(initialX, index < 7 ? targetXLeft : targetXRight, easeInOut(progress))
          : lerp(initialX, initialPositions[index].x, easeInOut(progress));
      drawing(ctx, x, targetY, targetWidth, targetHeight, building.line, building.color);
    });
    animationRequestId = progress < 1 ? requestAnimationFrame(animateStep) : null;
  };
  animationRequestId = requestAnimationFrame(animateStep);
}
// Canvas内容移动过渡函数
const lerp = (start, end, t) => { return start * (1 - t) + end * t }
// 渐进渐出函数
const easeInOut = t => { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }

onMounted(() => {
  window.addEventListener("beforeunload", () => { window.scroll(0, 0) });
  const ctx = canvas.value.getContext('2d');
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.value.width = width;
  canvas.value.height = height;
  buildings.forEach(building => {
    const x = building.x * width;
    const y = building.y * height;
    const w = building.width * width;
    const h = building.height * height;
    initialPositions.push({ x, y });
    drawing(ctx, x, y, w, h, building.line, building.color);
  });
  if (isInitialLoad.value) {
    wheelEventDisabled = true;
    canvasMove(false);
    isInitialLoad.value = false;
    setTimeout(() => {
      wheelEventDisabled = false;
      bubbleVis.value = true;
    }, 1500)
  }
});
onBeforeRouteLeave((to, from, next) => {
  cancelAnimationFrame(animationRequestId);
  next();
});

const links = [
  {
    title: '简陋的主页',
    value: 'home',
    icon: 'mdi-view-dashboard-outline'
  },{
    title: '乱写的文章',
    value: 'articles',
    icon: 'mdi-notebook-outline',
  },{
    title: '瞎拍的照片',
    value: 'photos',
    icon: 'mdi-camera-wireless-outline'
  },{
    title: '摆烂的某人',
    value: 'me',
    icon: 'mdi-account-question-outline'
  }
]
const handleClick = () => {
  router.push('/articles');
}

onMounted(() => {
  document.title = "LIFE AT 1AM."
});
</script>

<template>
  <div class="container">
    <div class="navbar pl-5 pr-3 rounded-pill elevation-5" @wheel.prevent>
      <v-tabs center-active show-arrows color="grey-darken-2" class="w-75">
        <v-tab
            :disabled="jumpDisable"
            v-for="link in links"
            :to="'/' + link.value">
          {{ link.title }}
        </v-tab>
      </v-tabs>
      <v-spacer />

      <v-avatar size="32" ><v-img src="../assets/images/my-avatar.jpg" /></v-avatar>
    </div>

    <div class="w-100" @wheel.prevent="handleWheel">
      <Bubbles v-if="bubbleVis"></Bubbles>
      <canvas ref="canvas"></canvas>
      <div class="d-flex flex-wrap h-screen bg-background">
        <div class="center d-flex w-100 justify-center align-center" ref="centerDiv">
          <div class="circle d-flex rounded-circle">
            <img class="moon" :src="moonSvg" alt="Moon">
          </div>
          <div class="title">L<strong>1AM</strong>の熬夜空间</div>
        </div>
        <div class="w-100">
          <div class="d-flex justify-center" ref="buttonDiv">
            <v-btn :disabled="jumpDisable" class="text-text" variant="plain" size="x-large" @click="handleClick">
              <template v-slot:prepend>
                <v-icon icon="mdi-door-open"></v-icon>
              </template>
              进去瞅一眼
            </v-btn>
          </div>
        </div>
        <div class="w-100">
          <div class="d-flex justify-center" ref="stepDiv">
            <Steps />
          </div>
        </div>
      </div>

      <div class="content bg-background">
        <v-container>
          <v-row>
            <v-progress-linear
                v-if="sentenceLoading"
                :indeterminate="true"/>
            <v-carousel
                v-else
                :cycle="true"
                interval="4000"
                hide-delimiters
                show-arrows="hover"
                progress>
              <v-carousel-item v-for="sentence in sentences">
                <div class="d-flex align-center justify-center h-100">
                  <v-card class="px-16 elevation-0">
                    <v-card-item class="mb-0">
                      <v-card-title class="card-title">
                        <v-icon class="mr-2" icon="mdi-calendar"/>{{ sentence.date }}
                      </v-card-title>
                    </v-card-item>
                    <v-card-text class="card-content">
                      {{ sentence.content }}
                    </v-card-text>
                  </v-card>
                </div>
              </v-carousel-item>
            </v-carousel>
          </v-row>
          <v-row class="my-6 justify-center">
            <RunTime class="d-flex align-center" />
          </v-row>
          <v-row class="bottom">
            <v-container class="py-2 px-4 text-no-wrap text-center w-100 bg-surface rounded-lg">
              <v-row>
                <v-col>
                  <p>Powered by <span class="text-decoration-line-through">ChatGPT</span> Vue & SpringBoot</p>
                </v-col>
                <v-col>
                  <p>© 2023 Copyright LiamLiang</p>
                </v-col>
                <v-col>
                  <a href="https://beian.miit.gov.cn/" target="_blank">闽ICP备2023005455号-1</a>
                </v-col>
                <v-col>
                  <a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=35020302035710" target="_blank">
                    闽公网安备 35020302035710号
                  </a>
                </v-col>
              </v-row>
            </v-container>
          </v-row>
        </v-container>
      </div>
    </div>

  </div>

</template>

<style scoped>
.container {
  height: 200dvh;
  overflow: hidden !important;
}

.navbar {
  z-index: 999;
  width: 96dvw;
  height: 40px;
  background-color: #fed504;
  position: fixed;
  display: flex;
  top: 15px;
  left: 2dvw;
  align-items: center;
  transition: all 0.4s ease-in-out;
}
canvas {
  width: 100dvw;
  height: 100dvh;
  position: absolute;
}
.center {
  margin-top: 10dvh;
}
.circle {
  height: 35dvh;
  width: 35dvh;
  background-color: #26292f80;
  box-shadow: 0 0 10px 5px #ffffff50;
  animation: breathe 5s ease-in-out infinite;
}
.moon {
  user-select: none;
  width: 90%;
  height: 90%;
  margin-left: -1.5dvh;
  margin-top: 3.5dvh;
  transform: rotate(-25deg);
  animation: floating 5s ease-in-out infinite;
}
.title {
  position: absolute;
  font-size: calc(100dvw * 80 / 1920);
  letter-spacing: calc(100dvw * 25 / 1920);
}
.title strong {
  font-size: calc(100dvw * 50 / 1920);
}

.content {
  padding-top: 70px;
  height: 100dvh;
  .card-title {
    font-size: 16px;
    letter-spacing: 1px;
  }
  .card-content {
    font-size: 18px;
    letter-spacing: 1px;
    line-height: 1.2em;
  }
  .bottom a {
    text-decoration:none;
    transition: all 0.5s ease-in-out;
  }
  .bottom a:link {
    color: darkgrey;
  }
  .bottom a:hover {
    color: #4fc3dc;
  }
  .bottom a:visited {
    color: white;
  }
}
@keyframes breathe {
    0% {
      box-shadow: 0 0 10px 5px #ffffff50;
    }
    50% {
      box-shadow: 0 0 20px 10px #ffffff80;
    }
    100% {
      box-shadow: 0 0 10px 5px #ffffff50;
    }
  }
@keyframes floating {
  0% {
    transform: rotate(-25deg) translate(0);
  }
  50% {
    opacity: 70%;
    transform: rotate(-30deg) translateX(10px);
  }
  100% {
    transform: rotate(-25deg) translate(0);
  }
}
</style>