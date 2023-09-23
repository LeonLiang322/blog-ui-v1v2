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
    title: '文章',
    value: 'articles',
    icon: 'mdi-notebook-outline',
  },{
    title: '照片',
    value: 'photos',
    icon: 'mdi-camera-wireless-outline'
  },{
    title: '动态',
    value: 'journals',
    icon: 'mdi-comment-text-outline'
  },{
    title: '标签',
    value: 'tags',
    icon: 'mdi-tag-outline'
  },{
    title: '版本',
    value: 'versions',
    icon: 'mdi-update'
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


// 当点击应用栏按钮时
function handleCollapse() {
  drawer.value = !drawer.value;
}

// 当点击左侧导航栏中按钮时
const handleMenu = (value) => {

  router.push('/admin/' + value);
  // drawer.value = false;
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
  staleTime: 5 * 60 * 1000,
});


const handleSearch = () => {
  store.dispatch('snackbar/openSnackbar', {
    msg: '搜索功能还未开放哦~（<=那你放这里干啥嘛！）',
  });
}

onMounted(() => {
  window.addEventListener("beforeunload", () => { window.scroll(0, 0) });
});

onBeforeUnmount(() => {

})
</script>

<template>
  <v-app>
    <v-app-bar density="compact" color="primary">
      <v-app-bar-title class="ls-1">管理我的熬夜空间</v-app-bar-title>
      <v-app-bar-nav-icon class="bg-surface" size="x-small" @click="handleCollapse">
        <v-icon color="white">mdi-menu</v-icon>
      </v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        expand-on-hover
        rail>
      <v-list density="comfortable" nav>
        <v-list-item
            v-for="link in links"
            density="default"
            :prepend-icon="link.icon"
            :title="link.title"
            @click="handleMenu(link.value)" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="px-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>

</style>
