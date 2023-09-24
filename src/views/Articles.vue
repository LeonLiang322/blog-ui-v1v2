<script setup>
import req from "@/utils/handleReq";
import { usePagination, useRequest } from "vue-request";
import { inject, watch } from "vue";
import router from "@/router";
import bg from "@/assets/images/article-bg.jpg"
import {formatDate} from "../utils/DateUtil";

const clickArticleService = async (id) => {
  return await req.sys.patch('/articles/click/' + id);
}

const getArticlesService = async () => {
  const result = await req.sys.get('/articles', { page: current.value, size: 10 });
  return result.data.data;
}

// 分页获取文章
const {
  data: articles,
  current,
  totalPage,
  loading,
  changeCurrent
} = usePagination(getArticlesService, {
  pagination: {
    currentKey: 'current',
    totalPageKey: 'pages'
  },
  onSuccess: () => {
    if (current.value > totalPage.value) {
      current.value--;
      changeCurrent(current.value);
      return;
    }
    window.scrollTo(0, 0);
    sessionStorage.setItem('a_cur', current.value.toString());
  }
});
current.value = JSON.parse(sessionStorage.getItem('a_cur'));


const layoutLoading = inject('layoutLoading');
watch(loading, (value) => {
  layoutLoading.value = value;
});

const { runAsync: clickRun } = useRequest(clickArticleService, {
  defaultParams: [null],
});

const jump = async (id) => {
  loading.value = true;
  await clickRun(id);
  await router.push({path: '/article', query: { id: id }});
}

</script>

<template>
  <div>
    <v-item-group v-if="articles" :multiple="true">
      <v-container>
        <v-row>
          <v-col
              class="d-flex justify-center"
              v-for="article in articles.records"
              cols="12">
            <v-item v-slot="{ isSelected, toggle }">
              <v-card
                  class="card w-100 elevation-5"
                  max-width="800"
                  :ripple="false">
                <div style="cursor: pointer" class="position-relative d-inline-block w-100" @click="jump(article.id)">
                  <v-img
                      :src="article.thumbnail ? article.thumbnail : bg"
                      max-height="200"
                      cover>
                    <template v-slot:placeholder>
                      <v-row
                          class="fill-height ma-0"
                          align="center"
                          justify="center">
                        <v-progress-circular indeterminate color="primary" />
                      </v-row>
                    </template>
                  </v-img>
                  <div class="overlay d-flex flex-column position-absolute justify-center align-center pa-4 w-100 h-100 ls-5">
                    <p class="text-center">{{ article.title }}</p>
                    <p class="subtitle mt-2 text-center ls-3">{{ article.subtitle }}</p>
                    <p class="date mt-4 text-center ls-2">
                      <span v-if="article.edited">
                        <v-icon class="mr-1" size="large">mdi-update</v-icon>
                        更新于 {{ formatDate(article.edited)}}
                      </span>
                      <span v-else>
                        <v-icon class="mr-1" size="large">mdi-draw-pen</v-icon>
                        发表于 {{ formatDate(article.time) }}
                      </span>
                    </p>
                  </div>
                </div>
                <v-card-actions>
                  <v-container class="pt-0 pb-2">
                    <v-row no-gutters align="center">
                      <v-col class="d-flex align-center" sm="4">
                        <v-icon class="mr-2" icon="mdi-read" size="x-small"></v-icon>
                        <span class="mr-3">{{ article.clicked }}</span>
                      </v-col>
                      <v-col  sm="4" class="text-center">
                        <v-btn
                          v-if="article.tags.length > 0"
                          class="px-6"
                          density="compact"
                          variant="plain"
                          @click="toggle"
                          :icon="isSelected ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                      </v-col>
                      <v-col sm="4" class="text-end">
                        <v-btn variant="text" @click="jump(article.id)">看看写的啥</v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-actions>

                <v-expand-transition>
                  <div v-show="isSelected" class="w-100">
                    <v-divider />
                    <v-chip-group class="my-1 mx-4">
                      <v-chip
                          v-for="tag in article.tags"
                          class="rounded-lg mr-3 elevation-2 pa-2"
                          style="font-size: 14px"
                          variant="outlined"
                          size="small"
                          :ripple="false">
                        {{ tag.name }}
                      </v-chip>
                    </v-chip-group>
                  </div>
                </v-expand-transition>
              </v-card>
            </v-item>
          </v-col>
        </v-row>
      </v-container>
      <v-alert
          v-if="articles.records.length < 1"
          color="primary"
          icon="mdi-flask-empty-outline"
          density="compact">
        这里空空如也~去别的地方看看吧！
      </v-alert>
    </v-item-group>

    <v-alert
        v-if="!articles"
        class="w-auto mx-auto"
        max-width="400"
        color="primary"
        icon="mdi-hand-okay"
        density="compact">
      已经在努力加载啦~<span class="ml-4">ᓚᘏᗢ</span>
    </v-alert>
    <div v-else class="text-center mb-4">
      <v-pagination
          v-model="current"
          size="small"
          :disabled="loading"
          :length="totalPage"
          :total-visible="6" />
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: all 0.2s ease-in-out;
}
.card:hover {
  transform: translateY(-2px);
}
.overlay {
  top: 0;
  left: 0;
  background-color: #26292f50;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 0 5px black;
  color: #FED504;
  .subtitle {
    font-size: 1rem;
    color: white;
  }
  .date {
    font-size: .5rem;
    color: lightgrey;
  }
}

</style>