<script setup>
import {nextTick, onBeforeUnmount, onMounted, provide, ref} from "vue";
import RunTime from "@/components/RunTime.vue";
import {useRequest} from "vue-request";
import req from "@/utils/handleReq";
import store from "@/store";
import router from "@/router";

const firstNote = ref(false);
if(!window.localStorage.getItem('firstNote')) {
  firstNote.value = true;
}
const dontShow = ref(false);
const handleDialog = () => {
  if (dontShow.value) {
    window.localStorage.setItem('firstNote', 'true');
  }
  firstNote.value = false;
}

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
];
const lock = ref(false);
const rail = ref(true); // 默认为true
const barOrder = ref(0);
const barCollapse = ref(false);
const search = ref('');
const drawer = ref(true);
const phone = ref(false);

const loading = ref(false);
provide('layoutLoading', loading);

function handleWheel(e) {
  if (lock.value) return;
  if (e.deltaY > 0) {
    // 向下滚动
    if (barOrder.value === 0 && window.scrollY > 500) {
      barCollapse.value = true; // 收起应用栏
      if (!phone.value) {
        rail.value = true; // 收起左侧导航栏
        setTimeout(() => {
          barOrder.value = -1; // 停靠应用栏至左侧
        }, 300);
      }
    }
  } else {
    // 向上滚动
    if (phone.value) barCollapse.value = false;
    if (barOrder.value === -1) {
      barOrder.value = 0; // 恢复应用栏至正常位
      setTimeout(() => {
        barCollapse.value = !rail.value // 收起应用栏
      }, 300);
    }
  }
}

// 当点击应用栏按钮时
function handleCollapse() {
  if (phone.value) {
    drawer.value = !drawer.value;
  } else {
    rail.value = !rail.value; // 反转左侧导航栏收展状态
    // 当应用栏停靠至左侧时
    if (barOrder.value === -1) {
      barOrder.value = 0; // 恢复应用栏至正常位
      barCollapse.value = true; // 收起应用栏
    } else {
      barCollapse.value = !barCollapse.value; // 反转应用栏收展状态
    }
  }
}

// 当点击左侧导航栏中按钮时
const handleMenuClick = () => {
  rail.value = false; // 展开左侧导航栏
  if (!phone.value) barCollapse.value = true; // 收起应用栏
  barOrder.value = 0; // 恢复应用栏至正常位
}

const getInfoService = async () => {
  const results = await req.sys.get('/general/info');
  return results.data.data;
}
// 获取所有数据
const {
  data,
  loading: dataLoading,
} = useRequest(getInfoService, {
  manual: false,
  staleTime: 5 * 60 * 1000,
});

const handleResize = () => {
  const narrow = window.innerWidth <= 500;
  phone.value = narrow;
  rail.value = !narrow;
  if (narrow) {
    barOrder.value = -1; // 恢复应用栏至正常位
    barCollapse.value = false;
  }

}

const handleSearch = () => {
  store.dispatch('snackbar/openSnackbar', {
    msg: '搜索功能还未开放哦~（<=那你放这里干啥嘛！）',
  });
}

onMounted(() => {
  nextTick(() => {
    handleResize();
  })
  window.addEventListener("beforeunload", () => { window.scroll(0, 0) });
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
})
</script>

<template>
  <v-app @wheel="handleWheel">
    <!--左侧抽屉-->
    <v-navigation-drawer
        class="px-1 elevation-8"
        v-model="drawer"
        :rail="rail"
        rail-width="70"
        :permanent="!phone"
        :temporary="phone">
      <v-list :nav="true">
        <v-list-item
            :to="'/'+link.value"
            v-for="link in links"
            class="rounded-be-xl mb-3"
            :prepend-icon="link.icon"
            :value="link.value">
          <v-list-item-title class="menu-title">{{link.title}}</v-list-item-title>
          <v-tooltip
              v-if="rail"
              activator="parent"
              location="end">
            {{ link.title }}
          </v-tooltip>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="mx-1 text-center" @click="handleMenuClick">
          <v-text-field
              single-line
              v-model="search"
              class="mb-n1"
              color="primary"
              :label="rail ? '' : '关键字搜索..'"
              variant="solo-filled"
              @keydown.enter="handleSearch">
            <template v-slot:prepend-inner>
              <v-expand-x-transition>
                <v-icon v-if="rail" class="ml-1">mdi-magnify</v-icon>
              </v-expand-x-transition>
            </template>
            <template v-slot:append-inner>
              <v-expand-x-transition>
                <v-btn
                    class="mr-n8"
                    v-show="!rail && search !== ''"
                    icon="mdi-magnify"
                    variant="plain"
                    @click="handleSearch" />
              </v-expand-x-transition>
            </template>
          </v-text-field>
        </div>
      </template>
    </v-navigation-drawer>


    <!--顶部应用栏-->
    <v-app-bar
        ref="appBar"
        density="comfortable"
        :collapse="barCollapse"
        :order="barOrder"
        scroll-threshold="1000"
        class="bg-primary elevation-8">
      <v-app-bar-nav-icon class="bg-surface ml-4 mr-3" size="x-small" @click="handleCollapse">
        <v-icon color="white">mdi-menu</v-icon>
        <v-tooltip activator="parent" location="bottom">{{ rail ? '展开' : '收起' }}</v-tooltip>
      </v-app-bar-nav-icon>
      <v-app-bar-nav-icon
          :class="lock ? 'bg-error' : 'bg-surface'"
          size="x-small"
          icon="mdi-lock-outline"
          @click="lock = !lock">
        <v-icon color="white">{{ lock ? 'mdi-lock-outline' : 'mdi-lock-open-outline' }}</v-icon>
        <v-tooltip activator="parent" location="bottom">{{ lock ? '解锁' : '锁定' }}</v-tooltip>
      </v-app-bar-nav-icon>
      <v-toolbar-title class="toolbar-title">L1am的熬夜空间</v-toolbar-title>
      <!--<div v-if="!barCollapse" class="mr-4">-->
      <!--  <v-btn-->
      <!--      density="default"-->
      <!--      color="surface"-->
      <!--      variant="text"-->
      <!--      prepend-icon="mdi-clipboard-text-outline"-->
      <!--      @click="router.push('/board');">-->
      <!--    留言板-->
      <!--  </v-btn>-->
      <!--</div>-->
      <!--<div v-if="!barCollapse" class="mr-4">-->
      <!--  <v-btn-->
      <!--      density="comfortable"-->
      <!--      color="surface"-->
      <!--      variant="text"-->
      <!--      prepend-icon="mdi-login">-->
      <!--    登录-->
      <!--  </v-btn>-->
      <!--</div>-->
      <v-progress-linear
          :active="loading"
          :indeterminate="loading"
          :absolute="true"
          bottom
          :height="5"
          color="white"/>
    </v-app-bar>

    <!--右侧导航栏-->
    <v-navigation-drawer
        class="rounded-lg elevation-8"
        location="right"
        :floating="true">
      <v-container class="d-flex justify-center h-100 text-center">
        <v-row>
          <v-col cols="12">
            <v-avatar class="avatar mx-auto mt-10 elevation-5" size="150" @click="router.push('/me')">
              <v-img src="../assets/images/my-avatar.jpg" alt="my-avatar"/>
            </v-avatar>
            <p class="mt-4 ls-2">Liam Liang</p>
          </v-col>
          <v-col cols="12"></v-col>
          <v-col cols="12">
            <RunTime />
            <v-table v-if="data" class="mt-5 ls-1" style="font-size: .9rem">
              <tbody>
              <tr>
                <td class="d-flex align-center">
                  <v-icon size="small" class="mr-2">mdi-book-check</v-icon>文章总数
                </td>
                <td>
                  <v-progress-circular v-if="dataLoading" indeterminate color="primary" size="20"/>
                  <p v-else>{{ data.narticle }}</p>
                </td>
              </tr>
              <tr>
                <td class="d-flex align-center">
                  <v-icon size="small" class="mr-2">mdi-image-check</v-icon>照片总数
                </td>
                <td>
                  <v-progress-circular v-if="dataLoading" indeterminate color="primary" size="20"/>
                  <p v-else>{{ data.nphoto }}</p>
                </td>
              </tr>
              <tr>
                <td class="d-flex align-center">
                  <v-icon size="small" class="mr-2">mdi-calendar-check</v-icon>日记总数
                </td>
                <td>
                  <v-progress-circular v-if="dataLoading" indeterminate color="primary" size="20"/>
                  <p v-else>{{ data.nsentence }}</p>
                </td>
              </tr>
              <tr>
                <td class="d-flex align-center">
                  <v-icon size="small" class="mr-2">mdi-bookmark-check</v-icon>标签总数
                </td>
                <td>
                  <v-progress-circular v-if="dataLoading" indeterminate color="primary" size="20"/>
                  <p v-else>{{ data.ntag }}</p>
                </td>
              </tr>
              <tr>
                <td class="d-flex align-center">
                  <v-icon size="small" class="mr-2">mdi-comment-check</v-icon>评论总数
                </td>
                <td>
                  <v-progress-circular v-if="dataLoading" indeterminate color="primary" size="20"/>
                  <p v-else>{{ data.ncomment }}</p>
                </td>
              </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </v-container>
    </v-navigation-drawer>

    <!--内容主体-->
    <v-main class="d-flex align-center justify-center w-100">
      <v-container class="px-6">
        <router-view class="main" />
        <v-sheet v-if="!loading" class="footer mt-2 py-1 bg-transparent d-flex justify-center align-center ls-1">
          <span>© 2023 Copyright LiamLiang</span>
          <v-divider :vertical="true" class="mx-3" thickness="2" />
          <a href="https://beian.miit.gov.cn/" target="_blank">闽ICP备2023005455号-1</a>
          <v-divider :vertical="true" class="mx-3" thickness="2" />
          <a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=35020302035710" target="_blank">
            闽公网安备 35020302035710号
          </a>
        </v-sheet>
      </v-container>
    </v-main>
  </v-app>
  <v-dialog
      v-model="firstNote"
      width="auto">
    <v-card class="pa-2">
      <v-card-title class="text-primary">
        (＾Ｕ＾)ノ~ＹＯ
      </v-card-title>
      <v-card-text class="note">
        <p>欢迎来到我的博客~</p>
        <p>可能你已经看过那个首页了?其实正式版并没有做好，所以我就先随便搞了下哈哈，请不要介意~以后我会更新的！！</p>
        <p>目前很多功能都还在加急开发中...比如互动这块，我还要好好琢磨琢磨。毕竟互联网嘛，发言还是需要一定的审查机制的。敬请期待！</p>
        <p>先随便逛逛咯！Take your time！</p>
        <p>(￣y▽,￣)╭ </p>
      </v-card-text>
      <v-card-actions>
        <v-checkbox
            v-model="dontShow"
            label="不再显示"
            color="success"
            hide-details />
        <v-btn color="primary" @click="handleDialog">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.toolbar-title {
  letter-spacing: 1px;
}
.menu-title {
  /*border: 1px solid red;*/
  font-size: 15px;
  letter-spacing: 2px;
}
.main {
  min-width: 300px;
}
.avatar {
  transition: all .2s ease-in-out;
}
.avatar:hover {
  cursor: pointer;
  transform: rotate(45deg);
}
.footer {
  font-size: 12px;
}
.footer a {
  text-decoration: none;
  transition: all 0.5s ease-in-out;
}
.footer a:link {
  color: darkgrey;
}
.footer a:hover {
  color: #4fc3dc;
}
.footer a:visited {
  color: white;
}
.note p {
  margin-bottom: .5rem;
}
</style>
