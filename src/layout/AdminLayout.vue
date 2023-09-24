<script setup>
import {onBeforeUnmount, onMounted, provide, ref} from "vue";
import router from "@/router";

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

const drawer = ref(true);
const phone = ref(false);

const loading = ref(false);
provide('layoutLoading', loading);

const back = () => {
  const from = sessionStorage.getItem('router_from');
  from ? router.push(from) : router.push('/');
}

const handleResize = () => {
  phone.value = window.innerWidth <= 500;
}
window.addEventListener('resize', handleResize);

onMounted(() => {
  window.addEventListener("beforeunload", () => { window.scroll(0, 0) });
});

onBeforeUnmount(() => {

})
</script>

<template>
  <v-app>
    <v-app-bar density="comfortable" color="primary">
      <v-app-bar-nav-icon class="bg-surface mx-4" size="x-small" @click="drawer = !drawer;">
        <v-icon color="white">mdi-menu</v-icon>
      </v-app-bar-nav-icon>
      <v-app-bar-title class="ls-1">管理我的熬夜空间</v-app-bar-title>
      <v-btn
          size="large"
          density="comfortable"
          prepend-icon="mdi-arrow-u-left-top-bold"
          @click="back">返回</v-btn>
    </v-app-bar>
    <v-navigation-drawer
        v-model="drawer"
        :expand-on-hover="!phone"
        :rail="!phone"
        rail-width="60">
      <v-list density="default" nav>
        <v-list-item
            height="60"
            v-for="link in links"
            @click="router.push('/admin/' + link.value)">
          <template v-slot:prepend>
            <v-icon size="large">{{ link.icon }}</v-icon>
          </template>
          <v-list-item-title>
            <p style="font-size: 1rem">{{ link.title }}</p>
          </v-list-item-title>
        </v-list-item>
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
