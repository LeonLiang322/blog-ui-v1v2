<script setup>
import {inject, nextTick, onBeforeUnmount, onMounted, provide, ref} from "vue";
import RunTime from "@/components/RunTime.vue";
import {useRequest} from "vue-request";
import req from "@/utils/handleReq";
import store from "@/store";
import router from "@/router";
import bar from "@/assets/images/bar.png";
import loginBg from "@/assets/images/login-bg.png";
import {JSEncrypt} from "jsencrypt";
import jwtDecode from "jwt-decode";
const reload = inject('reload');

const getKeyService = async () => {
  const result = await req.sys.get('/users/key');
  return result.data.data;
}

const loginService = async v => {
  const result = await req.sys.post('/users/login', v);
  return result.data.data;
}

const logoutService = async v => {
  const result = await req.sys.post('/users/logout', v);
  return result.data.data;
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

// 获取密钥标签
const {
  data: publicKey,
  runAsync: getKeyRun,
} = useRequest(getKeyService, {});

// 用户登录
const {
  data: token,
  runAsync: loginRun
} = useRequest(loginService, {
  defaultParams: [{}],
});

// 用户注销
const {
  data: isLogout,
  loading: logoutLoading,
  runAsync: logoutRun
} = useRequest(logoutService, {
  defaultParams: [''],
});

const firstNote = ref(false);
if(!window.localStorage.getItem('firstNote')) {
  firstNote.value = true;
}
const dontShow = ref(false);
const handleDialog = () => {
  if (dontShow.value) window.localStorage.setItem('firstNote', 'true');
  firstNote.value = false;
}

const links = ref([
  {
    title: '乱写的文章',
    value: 'articles',
    icon: 'mdi-notebook-heart',
  },{
    title: '瞎拍的照片',
    value: 'photos',
    icon: 'mdi-camera-image'
  },{
    title: '摆烂的某人',
    value: 'me',
    icon: 'mdi-bed'
  }
]);

const userInfo = ref();
const localToken = localStorage.getItem('token');
if (localToken) {
  userInfo.value = jwtDecode(localToken);
  if (userInfo.value.admin) {
    links.value.push({
      title: '管理我的博客',
      value: 'admin',
      icon: 'mdi-cogs'
    })
  }
}

const lock = ref(false);
const rail = ref(false);
const search = ref('');
const drawer = ref(true);
const phone = ref(false);
const loading = ref(false);
provide('layoutLoading', loading);

// 当点击展开按钮时
function handleCollapse() {
  if (phone.value) drawer.value = !drawer.value;
  else rail.value = !rail.value;
}

const handleResize = () => {
  const winWidth = window.innerWidth;

  if (winWidth > 900) {
    phone.value = false;
    rail.value = false;
  } else if (winWidth > 600) {
    phone.value = false;
    rail.value = true;
  } else {
    phone.value = true;
  }
}

const login = ref(false);
const loginLoading = ref(false);
const loginForm = ref();
const mail = ref();
const password = ref();
const passwordVis = ref(false);
const mailRule = [
  v => !!v || '请填写邮箱',
  v => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(v) || '邮箱格式错误',
];
const passwordRule = [
  v => !!v || '请填写密码',
  v => (v && v.length > 8 && v.length < 20) || '密码长度在8~20之间',
];

const onLogin = async () => {

  const { valid } = await loginForm.value.validate();
  if (valid) {
    loginLoading.value = true;
    await getKeyRun();
    if (publicKey.value) {
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(publicKey.value);
      const data = { mail: mail.value, password: encryptor.encrypt(password.value) };
      await loginRun(data);
      if (token.value) {
        localStorage.setItem('token', token.value);
        await store.dispatch('snackbar/openSnackbar', {
          msg: '登录成功',
          type: 'success'
        });
        loginLoading.value = false;
        reload();
        return;
      }
    }
  }
  loginLoading.value = false;
  await store.dispatch('snackbar/openSnackbar', {
    msg: '登录失败',
    type: 'error'
  });
}

const profile = ref(false);

const logout = async () => {
  if (userInfo.value) {
    await logoutRun(localToken);
    if (isLogout.value) {
      await store.dispatch('snackbar/openSnackbar', {
        msg: '注销成功',
        type: 'success'
      });
      localStorage.removeItem('token');
    } else {
      await store.dispatch('snackbar/openSnackbar', {
        msg: '注销失败',
        type: 'error'
      });
    }
  }
  reload();
}

const handleSearch = () => {
  store.dispatch('snackbar/openSnackbar', {
    msg: '搜索功能还未开放~（那你放这里干啥?！）',
  });
}

onMounted(() => {
  nextTick(() => {
    handleResize();
  });
  window.addEventListener("beforeunload", () => { window.scroll(0, 0) });
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
})

</script>

<template>
  <v-app>
    <vue-particles
        color="#FED504"
        :particleOpacity="0.7"
        :particlesNumber="100"
        shapeType="circle"
        :particleSize="4"
        linesColor="#03DAC6"
        :linesWidth="1"
        :lineLinked="true"
        :lineOpacity="0.4"
        :linesDistance="100"
        :moveSpeed="3"
        :hoverEffect="true"
        hoverMode="grab"
        :clickEffect="true"
        clickMode="push">
    </vue-particles>

    <!--顶部应用栏-->
    <v-app-bar
        class="bg-primary elevation-8"
        style="transition: all .3s ease-in-out, min-width .2s ease-in-out"
        :style="rail ? 'min-width: 80px' : 'min-width: 260px'"
        ref="appBar"
        density="comfortable"
        :scroll-behavior="phone || lock ? '' : 'collapse'"
        scroll-threshold="500"
        :image="bar">
      <v-app-bar-nav-icon class="bg-surface ml-4" size="x-small" @click="handleCollapse">
        <v-icon v-if="phone" color="white">mdi-menu</v-icon>
        <v-icon v-else color="white">{{rail ? 'mdi-forwardburger' : 'mdi-backburger'}}</v-icon>
        <v-tooltip v-if="!phone" activator="parent" location="bottom">{{ rail ? '展开' : '收起' }}</v-tooltip>
      </v-app-bar-nav-icon>
      <v-app-bar-nav-icon
          v-if="!phone"
          class="ml-3"
          :class="lock ? 'bg-yellow-darken-3' : 'bg-surface'"
          size="x-small"
          icon="mdi-lock-outline"
          @click="lock = !lock">
        <v-icon color="white">{{ lock ? 'mdi-lock-outline' : 'mdi-lock-open-outline' }}</v-icon>
        <v-tooltip v-if="!phone" activator="parent" location="bottom">{{ lock ? '解锁' : '锁定' }}</v-tooltip>
      </v-app-bar-nav-icon>
      <v-toolbar-title class="toolbar-title" style="transition: all 0.5s ease-in-out">
        Leon 的熬夜空间
      </v-toolbar-title>

      <div class="ml-4 mr-2">
        <v-menu
            v-if="userInfo"
            v-model="profile"
            :close-on-content-click="false"
            location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
                v-bind="props"
                size="large"
                density="comfortable"
                color="surface"
                variant="text"
                prepend-icon="mdi-card-account-details-outline">
              <p class="font-weight-bold">{{ userInfo.name }}</p>
            </v-btn>
          </template>
          <v-card
              class="mt-6 pa-0"
              :loading="logoutLoading"
              elevation="4"
              min-width="140">
            <v-list :style="{backgroundImage: 'url('+ loginBg +')'}" density="comfortable" nav>
              <v-list-item class="bg-transparent" color="primary" disabled>
                <template v-slot:prepend>
                  <v-icon>mdi-account</v-icon>
                </template>
                <v-list-item-title>
                  <p>个人主页</p>
                </v-list-item-title>
              </v-list-item>
              <v-list-item color="primary" @click="logout">
                <template v-slot:prepend>
                  <v-icon>mdi-logout-variant</v-icon>
                </template>
                <v-list-item-title>
                  <p>注销</p>
                </v-list-item-title>
              </v-list-item>
            </v-list>
            <v-progress-linear
                :active="loading"
                :indeterminate="loginLoading"
                :absolute="true"
                bottom
                :height="5"
                color="white"/>
          </v-card>
        </v-menu>
        <v-menu
            v-else
            v-model="login"
            :close-on-content-click="false"
            location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
                v-bind="props"
                size="large"
                density="comfortable"
                color="surface"
                variant="text"
                prepend-icon="mdi-login-variant">
              <p class="font-weight-bold">登录</p>
            </v-btn>
          </template>
          <v-card
              class="login mt-6"
              color="white"
              :style="{backgroundImage: 'url('+ loginBg +')'}"
              elevation="4"
              min-width="300">
            <v-card-text>
              <v-form
                  class="pt-4"
                  ref="loginForm"
                  validate-on="lazy blur"
                  fast-fail
                  @submit.prevent="onLogin">
                <v-text-field
                    bg-color="#ffffff60"
                    v-model="mail"
                    :readonly="loading"
                    :rules="mailRule"
                    density="compact"
                    variant="outlined"
                    label="账号邮箱"
                    clearable>
                  <template v-slot:prepend-inner>
                    <v-icon size="small">mdi-email-outline</v-icon>
                  </template>
                </v-text-field>
                <v-text-field
                    class="mt-2"
                    bg-color="#ffffff60"
                    v-model="password"
                    :readonly="loading"
                    :rules="passwordRule"
                    :type="passwordVis ? 'text' : 'password'"
                    density="compact"
                    variant="outlined"
                    label="密码"
                    clearable>
                  <template v-slot:prepend-inner>
                    <v-icon size="small">mdi-lock-outline</v-icon>
                  </template>
                  <template v-slot:append-inner>
                    <v-icon class="ml-2" size="small" @click="passwordVis = !passwordVis">
                      {{ passwordVis ? 'mdi-eye-off' : 'mdi-eye' }}
                    </v-icon>
                  </template>
                </v-text-field>
                <v-scroll-y-reverse-transition>
                  <v-btn
                      class="my-2"
                      :loading="loginLoading"
                      color="primary"
                      size="default"
                      type="submit"
                      block>
                    登录
                  </v-btn>
                </v-scroll-y-reverse-transition>
              </v-form>
            </v-card-text>
          </v-card>
        </v-menu>
      </div>
      <v-progress-linear
          :active="loading"
          :indeterminate="loading"
          :absolute="true"
          bottom
          :height="5"
          color="white"/>
    </v-app-bar>

    <!--左侧抽屉-->
    <v-navigation-drawer
        class="pt-4 px-1 elevation-8"
        width="220"
        v-model="drawer"
        :temporary="phone"
        :permanent="!phone"
        :rail="rail"
        rail-width="70">
      <v-list :nav="true">
        <v-list-item
            :to="'/'+link.value"
            v-for="link in links"
            class="rounded-be-xl mb-3"
            :value="link.value">
          <template v-slot:prepend>
            <v-icon color="primary">{{ link.icon }}</v-icon>
          </template>
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
        <div class="mx-1 text-center">
          <v-text-field
              single-line
              v-model="search"
              class="mb-n1"
              color="primary"
              :label="rail ? '' : '关键字搜索..'"
              variant="solo-filled"
              @keydown.enter="handleSearch">
            <template v-slot:prepend-inner>
              <v-icon v-if="rail" class="ml-1">mdi-magnify</v-icon>
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

    <!--右侧导航栏-->
    <v-navigation-drawer
        width="220"
        class="rounded-lg elevation-8"
        location="right"
        :floating="true">
      <v-container class="d-flex justify-center h-100 text-center">
        <v-row>
          <v-col cols="12">
            <v-avatar class="avatar mx-auto mt-10 elevation-5" size="150" @click="router.push('/me')">
              <v-img src="../assets/images/my-avatar.jpg" alt="my-avatar"/>
            </v-avatar>
            <p class="rainbow-font font-weight-bold mt-4 ls-2" style="font-size: 1.3rem">Leon Liang</p>
          </v-col>
          <v-col cols="12"></v-col>
          <v-col cols="12">
            <RunTime />
            <v-table class="mt-5 ls-1" style="font-size: .9rem">
              <tbody>
              <tr>
                <td class="d-flex align-center text-primary">
                  <v-icon size="small" class="mr-2">mdi-book-check</v-icon>文章总数
                </td>
                <td>
                  <v-progress-circular v-if="dataLoading" indeterminate color="primary" size="20"/>
                  <p class="rainbow-font" v-else>{{ data.narticle }}</p>
                </td>
              </tr>
              <tr>
                <td class="d-flex align-center text-primary">
                  <v-icon size="small" class="mr-2">mdi-image-check</v-icon>照片总数
                </td>
                <td>
                  <v-progress-circular v-if="dataLoading" indeterminate color="primary" size="20"/>
                  <p class="rainbow-font" v-else>{{ data.nphoto }}</p>
                </td>
              </tr>
              <tr>
                <td class="d-flex align-center text-primary">
                  <v-icon size="small" class="mr-2">mdi-calendar-check</v-icon>日记总数
                </td>
                <td>
                  <v-progress-circular v-if="dataLoading" indeterminate color="primary" size="20"/>
                  <p class="rainbow-font" v-else>{{ data.nsentence }}</p>
                </td>
              </tr>
              <tr>
                <td class="d-flex align-center text-primary">
                  <v-icon size="small" class="mr-2">mdi-bookmark-check</v-icon>标签总数
                </td>
                <td>
                  <v-progress-circular v-if="dataLoading" indeterminate color="primary" size="20"/>
                  <p class="rainbow-font" v-else>{{ data.ntag }}</p>
                </td>
              </tr>
              <tr>
                <td class="d-flex align-center text-primary">
                  <v-icon size="small" class="mr-2">mdi-comment-check</v-icon>评论总数
                </td>
                <td>
                  <v-progress-circular v-if="dataLoading" indeterminate color="primary" size="20"/>
                  <p class="rainbow-font" v-else>{{ data.ncomment }}</p>
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
        <!--<router-view class="main" />-->
        <router-view class="main" v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>

      </v-container>
    </v-main>

    <v-footer height="50" class="footer mb-2 d-flex justify-center align-center bg-transparent ls-1">
      <span>© 2023 Copyright Leon Liang</span>
      <a class="mx-4" href="https://beian.miit.gov.cn/" target="_blank">闽ICP备2023005455号-1</a>
      <a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=35020302035710" target="_blank">
        闽公网安备 35020302035710号
      </a>
    </v-footer>

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
        <p>2023年9月24日 - 懒得要死的我竟然真把整个系统重构了！！！正式进入2.0版本哈哈！</p>
        <p>页面稍稍做了一点优化，但目前很多功能仍在随性开发中...主要还是课业会比较忙，有空一定会继续上新！</p>
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

<style lang="scss" scoped>
#particles-js {
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index:0;
}
.toolbar-title {
  letter-spacing: 1px;
}
.menu-title {
  /*border: 1px solid red;*/
  font-size: 15px;
  letter-spacing: 2px;
}
.main {
  margin: 0 auto;
  min-width: 300px;
  max-width: 800px;
  min-height: 90vh;
}
.avatar {
  transition: all .2s ease-in-out;
}
.avatar:hover {
  cursor: pointer;
  transform: rotate(-45deg);
}
.footer {
  font-size: .5rem;
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
//.login::before {
//  content: "";
//  position: absolute;
//  top: 0;
//  left: 0;
//  width: 100%;
//  height: 100%;
//  background-color: #ffffff20;
//}
</style>
